import { Table } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Dispatch, ReactNode, SetStateAction, useCallback, useState, type JSX } from 'react';
import { ClinicalMeetingType } from '@/types/Meetings/Meetings.types';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IClinicalDashboardSample } from '../../../types/Dashboard.types';
import { IClinicalDashboardSearchOptions } from '../../../types/Search.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import PopupListItem from '../Components/Clinical/ListItem/PopupListItem';
import PopupHeader from '../Components/Clinical/PopupHeader';
import PopupSearchBar from '../Components/Clinical/SearchFilterSort/PopupSearchBar';

const useStyles = makeStyles(() => ({
  root: {
    height: '700px',
    maxHeight: 'calc(100vh - 248px - 64px)',
    width: '100%',
    maxWidth: '100%',
  },
  listWrapper: {
    height: 'calc(100% - 48px)',
    width: '100%',
  },
}));

const emptyOptions: Pick<IClinicalDashboardSearchOptions, 'searchId'> = {
  searchId: [],
};

interface IProps {
  date: string;
  selectedCases: string[];
  setSelectedCases: Dispatch<SetStateAction<string[]>>;
  clinicalMeetingType: ClinicalMeetingType;
}

function PopupDashboardTabContent({
  date,
  selectedCases,
  setSelectedCases,
  clinicalMeetingType,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, loading } = useUser();

  const [toggled, setToggled] = useState<Pick<IClinicalDashboardSearchOptions, 'searchId'> | undefined>(emptyOptions);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const fetchDashboardData = useCallback(
    async (page: number, limit: number) => {
      async function fetchDashboardDataFn(
        newPage: number,
        newLimit: number,
      ): Promise<IClinicalDashboardSample[]> {
        const samples = await zeroDashSdk.mtb.clinical.getRecords(
          {
            search: toggled?.searchId,
          },
          newPage,
          newLimit,
        );

        return samples;
      }

      if (currentUser?.id) {
        setDataLoading(true);
        const data = await fetchDashboardDataFn(page, limit);
        setDataLoading(false);
        return data;
      }
      return [];
    },
    [currentUser?.id, zeroDashSdk.mtb.clinical, toggled?.searchId],
  );

  const mapping = (
    dashboardItem: IClinicalDashboardSample,
  ): ReactNode => (
    <PopupListItem
      key={`${dashboardItem.analysisSetId}_${dashboardItem.patientId}_${dashboardItem.zero2FinalDiagnosis}`}
      date={date}
      data={dashboardItem}
      selectedCases={selectedCases}
      setSelectedCases={setSelectedCases}
      clinicalMeetingType={clinicalMeetingType}
    />
  );

  return (
    <div className={classes.root}>
      <PopupSearchBar
        toggled={toggled || emptyOptions}
        setToggled={setToggled}
        emptyOptions={emptyOptions}
        loading={dataLoading}
      />
      {!currentUser || loading ? (
        <LoadingAnimation />
      ) : (
        <Table stickyHeader style={{ height: '540px' }}>
          <TabContentWrapper
            className={classes.listWrapper}
            fetch={fetchDashboardData}
            beforeMappingContent={
              <PopupHeader />
            }
            mapping={mapping}
          />
        </Table>
      )}
    </div>
  );
}

export default PopupDashboardTabContent;
