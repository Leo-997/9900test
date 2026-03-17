import { ReactNode, useCallback, useEffect, useState, type JSX } from 'react';
import { Table } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IClinicalDashboardSample } from '../../../types/Dashboard.types';
import { IClinicalDashboardSearchOptions } from '../../../types/Search.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import ClinicalDashboardHeader from '../Components/Clinical/ClinicalDashboardHeader';
import ClinicalDashboardRow from '../Components/Clinical/ListItem/ClinicalDashboardRow';
import ClinicalSearchFilterBar from '../Components/Clinical/SearchFilterSort/ClinicalSearchFilterBar';

const useStyles = makeStyles(() => ({
  root: {
    background: '#FAFBFC',
    height: '100%',
    width: '100%',
    maxWidth: '100%',
  },
  listWrapper: {
    height: 'calc(100vh - 245px)',
    width: '100%',
  },
}));

const emptyOptions: IClinicalDashboardSearchOptions = {
  searchId: [],
  expedited: false,
  gender: [],
  vitalStatus: [],
  eventType: [],
  zero2FinalDiagnosis: [],
  sortColumns: [],
  sortDirections: [],
  clinicalStatus: [],
  assignees: [],
};

export default function ClinicalDashboardTabContent(): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, loading } = useUser();

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  const [dbFilters, setDbFilters] = useState<IClinicalDashboardSearchOptions>(emptyOptions);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const fetchDashboardData = useCallback(
    async (page: number) => {
      if (currentUser?.id) {
        setDataLoading(true);
        const mappedFilters = dbFilters
          ? zeroDashSdk.mtb.clinical.mapFilters(dbFilters)
          : undefined;
        const samples = await zeroDashSdk.mtb.clinical.getRecords(
          { ...mappedFilters },
          page,
          20,
        );

        setDataLoading(false);
        return samples;
      }
      return [];
    },
    [currentUser?.id, dbFilters, zeroDashSdk],
  );

  useEffect(() => {
    async function getTotal(): Promise<void> {
      const mappedFilters = dbFilters
        ? zeroDashSdk.mtb.clinical.mapFilters(dbFilters)
        : undefined;
      const resp = await zeroDashSdk.mtb.clinical.getRecordsCount(
        {
          ...mappedFilters,
        },
      );

      setTotalCount(resp);
    }

    getTotal();
  }, [dbFilters, zeroDashSdk]);

  const mapping = (
    dashboardItem: IClinicalDashboardSample,
    key: number,
    updateSamples?: (sample: IClinicalDashboardSample) => void,
  ): ReactNode => (
    <ClinicalDashboardRow
      key={`${dashboardItem.patientId}_${key}`}
      data={dashboardItem}
      updateSamples={updateSamples}
    />
  );

  return (
    <div className={classes.root}>
      <ClinicalSearchFilterBar
        toggled={dbFilters}
        setToggled={setDbFilters}
        emptyOptions={emptyOptions}
        counts={{ current: count, total: totalCount }}
        loading={dataLoading}
        setLoading={setDataLoading}
      />
      {!currentUser || loading ? (
        <LoadingAnimation />
      ) : (
        <Table stickyHeader>
          <TabContentWrapper
            className={classes.listWrapper}
            fetch={fetchDashboardData}
            updateCount={setCount}
            beforeMappingContent={<ClinicalDashboardHeader />}
            mapping={mapping}
          />
        </Table>
      )}
    </div>
  );
}
