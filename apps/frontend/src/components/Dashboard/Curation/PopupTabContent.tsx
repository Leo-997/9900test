import { makeStyles } from '@mui/styles';
import { ReactNode, useCallback, useState, type JSX } from 'react';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import { PopupSearchBar } from '../Components/Common/SearchFilterSort/PopupSearchBar';
import { PopupListItem } from '../Components/Curation/ListItem/PopupListItem';
import { PopupHeader } from '../Components/Curation/PopupHeader';

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

interface IProps {
  assignedSample: string[]
  addSampleId: (sampleId: string) => void;
  removeSampleId: (sampleId: string) => void;
}

function PopupTabContent({
  assignedSample,
  addSampleId,
  removeSampleId,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, loading } = useUser();

  const [toggled, setToggled] = useState<{searchId: string[]}>({
    searchId: [],
  });

  const fetchDashboardData = useCallback(
    async (page: number, limit: number) => {
      async function fetchDashboardDataFn(
        newPage: number,
        newLimit: number,
      ): Promise<IAnalysisSet[]> {
        const dashboardData = await zeroDashSdk.curation.analysisSets.getAnalysisSets(
          {
            search: toggled.searchId,
            curationStatus: [
              'Sequencing',
              'Ready to Start',
              'In Progress',
            ],
          },
          newPage,
          newLimit,
        );

        return dashboardData;
      }

      if (currentUser?.id) {
        const data = await fetchDashboardDataFn(page, limit);
        return data;
      }
      return [];
    },
    [currentUser?.id, zeroDashSdk.curation.analysisSets, toggled.searchId],
  );

  const mapping = (
    dashboardItem: IAnalysisSet,
  ): ReactNode => (
    <PopupListItem
      key={dashboardItem.publicSubjectId}
      data={dashboardItem}
      assignedSample={assignedSample}
      addSampleId={addSampleId}
      removeSampleId={removeSampleId}
    />
  );

  return (
    <div className={classes.root}>
      <PopupSearchBar
        toggled={toggled}
        setToggled={setToggled}
      />
      {!currentUser || loading ? (
        <LoadingAnimation />
      ) : (
        <TabContentWrapper
          className={classes.listWrapper}
          fetch={fetchDashboardData}
          beforeMappingContent={
            <PopupHeader />
          }
          mapping={mapping}
        />
      )}
    </div>
  );
}

export default PopupTabContent;
