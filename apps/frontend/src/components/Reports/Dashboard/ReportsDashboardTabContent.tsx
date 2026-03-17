import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { ApprovalStatus } from '@/types/Reports/Approvals.types';
import { makeStyles } from '@mui/styles';
import { ReactNode, useCallback, useEffect, useMemo, useState, type JSX } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { IGetReportsQuery, IReport } from '../../../types/Reports/Reports.types';
import LoadingAnimation from '../../Animations/LoadingAnimation';
import TabContentWrapper from '../../PreCurationTabs/TabContentWrapper';
import ReportListItem from './ReportListItem';
import ReportsDashboardHeader from './ReportsDashboardHeader';
import ReportsSearchFilterBar from './ReportsSearchFilterBar';

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

export default function ReportsDashboardTabContent(): JSX.Element {
  const classes = useStyles();
  const { loading } = useUser();
  const zeroDashSdk = useZeroDashSdk();

  const defaultFilters = useMemo<IGetReportsQuery>(() => ({
    statuses: ['pending', 'approved'],
  }), []);

  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [toggled, setToggled] = useState<IGetReportsQuery>(() => {
    const query = new URLSearchParams(window.location.search);
    return {
      ...defaultFilters,
      statuses: query.has('statuses') ? query.get('statuses')?.split(';') as ApprovalStatus[] : defaultFilters.statuses,
      approvers: query.has('approvers') ? query.get('approvers')?.split(';') : defaultFilters.approvers,
    };
  });

  const getMatchingSets = useCallback(async () => (
    zeroDashSdk.curation.analysisSets.getAnalysisSets({
      search: toggled.analysisSetIds,
    })
  ), [toggled.analysisSetIds, zeroDashSdk.curation.analysisSets]);

  useEffect(() => {
    const getCount = async (): Promise<void> => {
      const matchingSets: IAnalysisSet[] = [];
      if (toggled.analysisSetIds?.length) {
        matchingSets.push(...(await getMatchingSets()));
      }

      // User searched for something that does not exist
      if (toggled.analysisSetIds?.length && !matchingSets.length) {
        setTotalCount(0);
        return;
      }

      zeroDashSdk.services.reports.getReportsCount(
        {
          ...toggled,
          analysisSetIds: matchingSets.length
            ? matchingSets.map((a) => a.analysisSetId)
            : undefined,
          includeApprovals: true,
        },
      )
        .then((resp) => setTotalCount(resp));
    };
    getCount();
  }, [zeroDashSdk.services.reports, toggled, getMatchingSets]);

  const fetchDashboardData = useCallback(async (page: number) => {
    const matchingSets: IAnalysisSet[] = [];
    if (toggled.analysisSetIds?.length) {
      matchingSets.push(...(await getMatchingSets()));
    }

    // User searched for something that does not exist
    if (toggled.analysisSetIds?.length && !matchingSets.length) return [];

    const reports = await zeroDashSdk.services.reports.getReports(
      {
        ...toggled,
        analysisSetIds: matchingSets.length ? matchingSets.map((a) => a.analysisSetId) : undefined,
        includeApprovals: true,
      },
      page,
      20, // need 20 as the list items are small
    );
    return reports;
  }, [zeroDashSdk.services.reports, toggled, getMatchingSets]);

  const mapping = (
    report: IReport,
    key: number,
    updateReport?: (report: IReport) => void,
  ): ReactNode => (
    <ReportListItem
      key={report.id}
      report={report}
      updateReport={updateReport}
    />
  );

  return (
    <div className={classes.root}>
      <ReportsSearchFilterBar
        toggled={toggled || {}}
        setToggled={setToggled}
        defaultOptions={defaultFilters}
        counts={{ current: count, total: totalCount }}
        loading={loading}
      />
      {loading ? (
        <LoadingAnimation />
      ) : (
        <TabContentWrapper
          className={classes.listWrapper}
          fetch={fetchDashboardData}
          beforeMappingContent={<ReportsDashboardHeader />}
          mapping={mapping}
          updateCount={setCount}
        />
      )}
    </div>
  );
}
