import { styled, Table } from '@mui/material';
import {
  useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import { useSnackbar } from 'notistack';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IAnalysisPatient } from '@/types/Analysis/AnalysisSets.types';
import { Group } from '@/types/Auth/Group.types';
import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { ApprovalStatus } from '@/types/Reports/Approvals.types';
import { ITaskDashboardReport, ReportType } from '@/types/Reports/Reports.types';
import { CurationStatus } from '@/types/Samples/Sample.types';
import {
  IOverviewExport, ITaskDashboardFilters, TaskDashboardStage, TaskDashboardStatuses,
} from '@/types/TaskDashboard/TaskDashboard.types';
import { getReport } from '@/utils/components/taskdashboard/getReport';
import LoadingAnimation from '../Animations/LoadingAnimation';
import TabContentWrapper from '../PreCurationTabs/TabContentWrapper';
import TaskPatientBlock from './Content/ListItem/TaskPatientBlock';
import { TaskDashboardHeader } from './Content/TaskDashboardHeader';
import TaskSearchFilterBar from './SearchFilterSort/TaskSearchFilterBar';
import { SamplelessDashboardHeader } from '../Dashboard/Components/Common/SamplelessPatient/SamplelessDashboardHeader';
import { SamplelessPatientListItem } from '../Dashboard/Components/Common/SamplelessPatient/SamplelessPatientListItem';

const Root = styled('div')(() => ({
  height: '100%',
  width: '100%',
  maxWidth: '100%',
}));

const StyledTabContentWrapper = styled(TabContentWrapper<IAnalysisPatient>)(() => ({
  height: 'calc(100vh - 245px)',
  width: '100%',
}));

const emptyOptions: ITaskDashboardFilters = {
  search: [],
  stage: undefined,
  statuses: [],
  assignees: [],
  study: [],
  eventType: [],
  cohort: [],
  zero2Category: [],
  zero2Subcat1: [],
  zero2Subcat2: [],
  zero2FinalDiagnosis: [],
  expedited: false,
  activeCases: false,
  overdueReports: false,
  assignedSecCurator: undefined,
  enrolledOnlyCases: false,
};

export default function TaskDashboardTabContent(): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser, groups } = useUser();
  const { enqueueSnackbar } = useSnackbar();

  const [dbFilters, setDbFilters] = useState<ITaskDashboardFilters>(emptyOptions);
  // analysisSetIds where user is assigned in Clinical module
  const [slidesAssignedIds, setSlidesAssignedIds] = useState<string[]>();
  // analysisSetIds where user is assigned in Reports module
  const [reportsAssignedIds, setReportsAssignedIds] = useState<string[]>();
  // analysis sets matching selected filters (only statuses and assignees filters)
  const [aSetsMatchingFilters, setASetsMatchingFilters] = useState<string[] | null | undefined>();
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // If all 3 are undefined, it is the component's first render
  // and therefore useEffects have not yet triggered
  const areAllIdsInitialised = useMemo(() => (
    aSetsMatchingFilters !== undefined
    && slidesAssignedIds !== undefined
    && reportsAssignedIds !== undefined
  ), [aSetsMatchingFilters, reportsAssignedIds, slidesAssignedIds]);

  // There are selected dbFilters.statuses or dbFilters.assignees but no case matches
  const noStatusOrAssigneeMatches = aSetsMatchingFilters?.length === 0;

  const areSamplelessPatients = dbFilters.enrolledOnlyCases || dbFilters.withdrawnCases;

  const getCount = useCallback(
    async (): Promise<number> => {
      if (noStatusOrAssigneeMatches || !areAllIdsInitialised) {
        return 0;
      }

      const resp = await zeroDashSdk.curation.analysisSets.getAnalysisSetsCount({
        analysisSetIds: aSetsMatchingFilters || undefined,
        search: dbFilters.search,
        study: dbFilters.study,
        eventType: dbFilters.eventType,
        cohort: dbFilters.cohort,
        zero2Category: dbFilters.zero2Category,
        zero2Subcat1: dbFilters.zero2Subcat1,
        zero2Subcat2: dbFilters.zero2Subcat2,
        zero2FinalDiagnosis: dbFilters.zero2FinalDiagnosis,
        expedited: dbFilters.expedited,
        activeCases: dbFilters.activeCases,
        enrolledOnlyCases: dbFilters.enrolledOnlyCases,
        withdrawnCases: dbFilters.withdrawnCases,
      });

      return resp;
    },
    [
      aSetsMatchingFilters,
      areAllIdsInitialised,
      dbFilters.activeCases,
      dbFilters.cohort,
      dbFilters.enrolledOnlyCases,
      dbFilters.eventType,
      dbFilters.expedited,
      dbFilters.search,
      dbFilters.study,
      dbFilters.withdrawnCases,
      dbFilters.zero2Category,
      dbFilters.zero2FinalDiagnosis,
      dbFilters.zero2Subcat1,
      dbFilters.zero2Subcat2,
      noStatusOrAssigneeMatches,
      zeroDashSdk.curation.analysisSets,
    ],
  );

  const fetchAnalysisSetPatientsData = useCallback(async (
    page: number,
    limit: number,
  ) => zeroDashSdk.curation.analysisSets.getAnalysisSetPatients(
    {
      analysisSetIds: aSetsMatchingFilters || undefined,
      externalAssignedCases: [
        ...(slidesAssignedIds || []),
        ...(reportsAssignedIds || []),
      ],
      includeRelatedCases: !areSamplelessPatients,
      search: dbFilters.search,
      study: dbFilters.study,
      eventType: dbFilters.eventType,
      cohort: dbFilters.cohort,
      zero2Category: dbFilters.zero2Category,
      zero2Subcat1: dbFilters.zero2Subcat1,
      zero2Subcat2: dbFilters.zero2Subcat2,
      zero2FinalDiagnosis: dbFilters.zero2FinalDiagnosis,
      expedited: dbFilters.expedited,
      activeCases: dbFilters.activeCases,
      enrolledOnlyCases: dbFilters.enrolledOnlyCases,
      withdrawnCases: dbFilters.withdrawnCases,
    },
    page,
    limit,
  ), [
    areSamplelessPatients,
    aSetsMatchingFilters,
    dbFilters.activeCases,
    dbFilters.cohort,
    dbFilters.enrolledOnlyCases,
    dbFilters.eventType,
    dbFilters.expedited,
    dbFilters.search,
    dbFilters.study,
    dbFilters.withdrawnCases,
    dbFilters.zero2Category,
    dbFilters.zero2FinalDiagnosis,
    dbFilters.zero2Subcat1,
    dbFilters.zero2Subcat2,
    reportsAssignedIds,
    slidesAssignedIds,
    zeroDashSdk.curation.analysisSets,
  ]);

  const getDashboardData = useCallback(async (): Promise<IOverviewExport[]> => {
    if (noStatusOrAssigneeMatches || !areAllIdsInitialised) return [];

    const dashboardData: IOverviewExport[] = [];

    const limit = 100;

    const curationCountRecords = await getCount();
    const curationNumOfPages = Math.ceil(curationCountRecords / limit);
    const curationPagesArray = [...Array(curationNumOfPages).keys()].map((i) => i + 1);
    // Fetch IAnalysisSetPatient[] and transform it to IOverviewExport[]
    await Promise.all(
      curationPagesArray.map((page) => (
        fetchAnalysisSetPatientsData(page, limit)
          .then((resp) => dashboardData.push(...resp.flatMap(
            (patient) => patient.analysisSets
              .map((aset) => {
                const { analysisSets, ...restPatient } = patient;
                return {
                  ...aset,
                  relatedCases: analysisSets
                    .filter((a) => a.analysisSetId !== aset.analysisSetId),
                  ...restPatient,
                  molecularReport: null,
                  germlineReport: null,
                  mtbReport: null,
                  notes: '',
                };
              }),
          )))
      )),
    );

    // Then hydrate it with Reports, Clinical data, individual reports and notes
    // unless it is a patient with no sample or withdrawn
    if (dashboardData.length && !areSamplelessPatients) {
      try {
        const analysisSetIds = dashboardData.map((aSet) => aSet.analysisSetId);

        // CLINICAL
        const clinicalCount = await zeroDashSdk.mtb.clinical.getRecordsCount(
          {
            analysisSetIds,
          },
        );
        const clinicalNumOfPages = Math.ceil(clinicalCount / limit);
        const clinicalPagesArray = [...Array(clinicalNumOfPages).keys()].map((i) => i + 1);
        const clinicalResp = (await Promise.all(
          clinicalPagesArray.map((page) => zeroDashSdk.mtb.clinical.getRecords(
            {
              analysisSetIds: dashboardData.map((aSet) => aSet.analysisSetId),
            },
            page,
            limit,
          )),
        )).flatMap((clinicalDataInPage) => clinicalDataInPage);

        // REPORTS
        const reportsCount = await zeroDashSdk.services.reports.getReportsCount(
          {
            analysisSetIds,
            statuses: ['pending', 'approved'],
            pseudoStatuses: ['On Hold'],
          },
        );
        const reportsNumOfPages = Math.ceil(reportsCount / limit);
        const reportsPagesArray = [...Array(reportsNumOfPages).keys()].map((i) => i + 1);

        const reportsResp = (await Promise.all(
          reportsPagesArray.map((page) => zeroDashSdk.services.reports.getReports(
            {
              analysisSetIds,
              statuses: ['pending', 'approved'],
              pseudoStatuses: ['On Hold'],
              includeApprovals: true,
            },
            page,
            limit,
          )),
        )).flatMap((reportsInPage) => reportsInPage);

        const allReports = reportsResp
          .map((r) => ({
            ...r,
            approvals: r.approvals?.map((a) => ({
              ...a,
              groupName: groups.find((g) => g.id === a.groupId)?.name as Group,
            })),
          }));

        const allNotes = await zeroDashSdk.curationComments.getCommentThreads({
          analysisSetIds: dashboardData.map((aSet) => aSet.analysisSetId),
          includeComments: true,
          threadType: ['ANALYSIS'],
          entityType: ['ANALYSIS'],
        });

        return dashboardData.map((aSet) => {
          const aSetReports = allReports.filter((r) => r.analysisSetId === aSet.analysisSetId);

          // Get the most recently approved reports for each type of report
          const molecularReport = ((): ITaskDashboardReport | null => {
            const report = getReport(aSet.analysisSetId, 'MOLECULAR_REPORT', aSetReports || []);
            return report ? { ...report, startedAt: aSet.curationFinalisedAt } : null;
          })();

          const germlineReport = ((): ITaskDashboardReport | null => {
            const report = getReport(aSet.analysisSetId, 'GERMLINE_REPORT', aSetReports || []);
            return report ? { ...report, startedAt: aSet.curationFinalisedAt } : null;
          })();

          const mtbReport = ((): ITaskDashboardReport | null => {
            const report = getReport(aSet.analysisSetId, 'MTB_REPORT', aSetReports || []);
            return report ? { ...report, startedAt: aSet.curationFinalisedAt } : null;
          })();
          // Get previously generated germline report, if existing
          const inactiveSets = aSet?.relatedCases?.filter((a) => a.caseFinalisedAt);
          const prevGermlineReport: ITaskDashboardReport | null = inactiveSets
            ?.map((set) => {
              const setReports = allReports.filter((r) => r.analysisSetId === set.analysisSetId);
              const report = getReport(
                set.analysisSetId,
                'GERMLINE_REPORT',
                setReports || [],
              );

              if (!report) return report;

              return {
                ...report,
                startedAt: set.curationFinalisedAt,
              };
            })
            .find((r) => r?.approvedAt) || null;
          // Get the case's NOTES
          const caseNotes = allNotes.find(
            (n) => n.analysisSetId === aSet.analysisSetId && n.comments?.find((c) => c.type === 'NOTES'),
          )?.comments?.find(
            (c) => c.type === 'NOTES',
          )?.versions?.[0].comment;

          return {
            ...aSet,
            reports: aSetReports,
            clinicalData: clinicalResp.find((c) => c.analysisSetId === aSet.analysisSetId),
            molecularReport,
            germlineReport: germlineReport || prevGermlineReport,
            mtbReport,
            notes: caseNotes || '',
          };
        });
      } catch {
        enqueueSnackbar('Could not export data, please try again.', { variant: 'error' });
      }
    }

    return dashboardData;
  }, [
    areAllIdsInitialised,
    areSamplelessPatients,
    enqueueSnackbar,
    fetchAnalysisSetPatientsData,
    getCount,
    groups,
    noStatusOrAssigneeMatches,
    zeroDashSdk.curationComments,
    zeroDashSdk.mtb.clinical,
    zeroDashSdk.services.reports,
  ]);

  const fetch = useCallback(async (page: number): Promise<IAnalysisPatient[]> => {
    if (noStatusOrAssigneeMatches || !areAllIdsInitialised) {
      setDataLoading(false);
      return [];
    }

    let curationResp: IAnalysisPatient[] = [];
    try {
      setDataLoading(true);
      // First fetch Curation rows, using all ids that match dbFilters
      curationResp = await fetchAnalysisSetPatientsData(page, 20);

      // Then hydrate dashboard list items with Reports and Clinical data
      // unless they are patients with no sample or withdrawn
      if (curationResp.length && !areSamplelessPatients) {
        const reportsResp = await zeroDashSdk.services.reports.getReports(
          {
            analysisSetIds: curationResp.flatMap(
              (patient) => patient.analysisSets.flatMap((a) => a.analysisSetId),
            ),
            statuses: ['pending', 'approved'],
            pseudoStatuses: ['On Hold', 'N/A'],
            includeApprovals: true,
          },
        );

        const reports = reportsResp.map((r) => ({
          ...r,
          approvals: r.approvals?.map((a) => ({
            ...a,
            groupName: groups.find((g) => g.id === a.groupId)?.name as Group,
          })),
        }));

        curationResp = curationResp.map((p) => ({
          ...p,
          analysisSets: p.analysisSets.map((a) => ({
            ...a,
            reports: reports.filter((r) => r.analysisSetId === a.analysisSetId),
          })),
        }));

        const clinicalResp = await zeroDashSdk.mtb.clinical.getRecords(
          {
            analysisSetIds: curationResp.flatMap(
              (patient) => patient.analysisSets.flatMap((a) => a.analysisSetId),
            ),
          },
          page,
          20,
        );
        curationResp = curationResp.map((p) => ({
          ...p,
          analysisSets: p.analysisSets.map((a) => ({
            ...a,
            clinicalData: clinicalResp.find(
              (c) => c.analysisSetId === a.analysisSetId,
            ),
          })),
        }));
      }
    } catch {
      enqueueSnackbar('Could not load dashboard data, please try again.', { variant: 'error' });
      return [];
    } finally {
      setDataLoading(false);
    }
    return curationResp;
  }, [
    noStatusOrAssigneeMatches,
    areAllIdsInitialised,
    areSamplelessPatients,
    enqueueSnackbar,
    fetchAnalysisSetPatientsData,
    zeroDashSdk.services.reports,
    zeroDashSdk.mtb.clinical,
    groups,
  ]);

  const mapping = useCallback((
    analysisPatient: IAnalysisPatient,
    index: number,
    update?: (value: IAnalysisPatient) => void,
  ) => (
    areSamplelessPatients ? (
      <SamplelessPatientListItem
        key={`${analysisPatient.patientId}::${analysisPatient.study}`}
        patient={analysisPatient}
        updatePatient={update}
        loading={dataLoading}
        setLoading={setDataLoading}
      />
    ) : (
      <TaskPatientBlock
        key={analysisPatient.publicSubjectId}
        analysisPatient={analysisPatient}
        updateAnalysisPatient={update}
        toggled={dbFilters}
      />
    )), [areSamplelessPatients, dataLoading, dbFilters]);

  // Get the cases where current user is assigned in clinical, for sorting purposes in the BE
  useEffect(() => {
    const getClinicalCasesWhereUserAssigned = async (): Promise<void> => {
      if (areSamplelessPatients) {
        setSlidesAssignedIds([]);
        return;
      }

      const resp = await zeroDashSdk.mtb.clinical.getRecords({
        assignees: currentUser?.id ? [currentUser.id] : undefined,
      });

      setSlidesAssignedIds(resp.map((c) => c.analysisSetId));
    };

    getClinicalCasesWhereUserAssigned();
  }, [areSamplelessPatients, currentUser?.id, zeroDashSdk.mtb.clinical]);

  // Get the cases where current user is assigned in Reports, for sorting purposes in the BE
  useEffect(() => {
    const getReportsWhereUserAssigned = async (): Promise<void> => {
      if (areSamplelessPatients) {
        setReportsAssignedIds([]);
        return;
      }

      const resp = await zeroDashSdk.services.reports.getReports({
        approvers: currentUser?.id ? [currentUser.id] : undefined,
      });

      setReportsAssignedIds(resp.map((c) => c.analysisSetId));
    };

    getReportsWhereUserAssigned();
  }, [areSamplelessPatients, currentUser?.id, zeroDashSdk.services.reports]);

  // useEffect for getting the analysis set ids that match dbFilters.statuses & dbFilters.assignees
  useEffect(() => {
    // For each service, make api call with filters, in order to get matching analysis set ids
    const getMatchingFilters = async (): Promise<void> => {
      // helper function
      const shouldMakeApiCall = (stages: TaskDashboardStage[]): boolean => {
        const isStgTargetedByStatusFilter = Boolean(
          dbFilters.statuses?.length
          && dbFilters.stage
          && stages.includes(dbFilters.stage),
        );

        const isStgTargetedByAssigneeFilter = Boolean(
          dbFilters.assignees?.length
          && (
            (dbFilters.stage && stages.includes(dbFilters.stage))
            || !dbFilters.stage
          ),
        );

        return isStgTargetedByStatusFilter || isStgTargetedByAssigneeFilter;
      };

      setDataLoading(true);
      try {
        if (areSamplelessPatients) {
          setASetsMatchingFilters(null);
          return;
        }

        const parsedAssignees = dbFilters.assignees?.map((user) => (
          user.split('::')[1]
        ));

        // API CALL TO CLINICAL
        const clinicalCasesMatchFiltersIds = !dbFilters.overdueReports && shouldMakeApiCall(['MTB_SLIDES'])
          ? await zeroDashSdk.mtb.clinical.getRecords({
            clinicalStatus: dbFilters.statuses?.length
              ? dbFilters.statuses?.filter((s) => s !== 'On Hold') as ClinicalStatus[]
              : ['Ready to Start', 'In Progress'],
            pseudoStatuses: dbFilters.statuses?.includes('On Hold') ? ['On Hold'] : undefined,
            assignees: parsedAssignees,
          }).then((result) => result.map((r) => r.analysisSetId))
          : undefined;

        // API CALL TO REPORTS
        // Return only selected report stages as type filters, otherwise include all
        const getReportsTypeFilter = (): ReportType[] => {
          if (
            (dbFilters.statuses?.length || dbFilters.assignees?.length)
          && dbFilters.stage
          ) {
            if (['MOLECULAR_REPORT', 'GERMLINE_REPORT', 'MTB_REPORT'].includes(dbFilters.stage)) return [dbFilters.stage as ReportType];
          }

          return ['MOLECULAR_REPORT', 'GERMLINE_REPORT', 'MTB_REPORT'];
        };

        // Receives a Task Dashboard status and returns corresponding Report status
        const mapToReportStatuses = (
          unmappedStatuses: TaskDashboardStatuses[],
        ): ApprovalStatus[] | undefined => {
        // If there are no selected status, then user is filtering by user
        // Return pending reports
          if (!unmappedStatuses.length) return ['pending'];

          // User only selected a pseudostatus, but no normal report status
          if (!unmappedStatuses.filter((s) => s !== 'On Hold').length) return undefined;

          // Otherwise, map filters and return correct status
          const statusMap: Record<string, ApprovalStatus> = {
            'In Progress': 'pending',
            'Ready to Start': 'pending',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Done: 'approved',
          };

          return unmappedStatuses
            .map((s) => statusMap[s])
            // removes undefined items (pseudoStatus)
            .filter((s): s is ApprovalStatus => Boolean(s));
        };

        const reportsMatchFiltersIds = dbFilters.overdueReports || shouldMakeApiCall(['MOLECULAR_REPORT', 'GERMLINE_REPORT', 'MTB_REPORT'])
          ? await zeroDashSdk.services.reports.getReports({
            types: getReportsTypeFilter(),
            statuses: dbFilters.overdueReports
              ? ['pending']
              : mapToReportStatuses(dbFilters.statuses || []),
            approvers: parsedAssignees,
            pseudoStatuses: dbFilters.statuses?.includes('On Hold') ? ['On Hold'] : undefined,
          }).then((resp) => {
          // API CALL TO CURATION SERVICE IF WE ARE FILTERING OVERDUE REPORTS
            if (dbFilters.overdueReports && resp.length) {
              return zeroDashSdk.curation.analysisSets.getAnalysisSets({
                pendingReports: dbFilters.overdueReports
                  ? resp?.map((r) => `${r.analysisSetId}::${r.type}`)
                  : undefined,
              }).then((asets) => asets.map((a) => a.analysisSetId));
            }

            return resp.map((a) => a.analysisSetId);
          })
          : undefined;

        // API CALL TO CURATION SERVICE
        const curationMatchFiltersIds = !dbFilters.overdueReports && (shouldMakeApiCall(['CURATION']) || dbFilters.assignedSecCurator)
          ? await zeroDashSdk.curation.analysisSets.getAnalysisSets({
            curationStatus: dbFilters.statuses?.filter((s) => s !== 'On Hold') as CurationStatus[],
            primaryCurators: parsedAssignees,
            secondaryCurators: dbFilters.assignedSecCurator
              ? [dbFilters.assignedSecCurator]
              : undefined,
            pseudoStatuses: dbFilters.statuses?.includes('On Hold') ? ['On Hold'] : undefined,
            activeCases: dbFilters.statuses?.length ? undefined : true,
            includeRelatedCases: false,
            includeBiosamples: false,
          }).then((result) => result.map((r) => r.analysisSetId))
          : undefined;

        // SET ALL ANALYSIS SET IDS THAT MATCH CURRENT FILTERS
        if (
          clinicalCasesMatchFiltersIds === undefined
          && reportsMatchFiltersIds === undefined
          && curationMatchFiltersIds === undefined
        ) {
        // filters are empty, set this to null to trigger an unfiltered fetch
          setASetsMatchingFilters(null);
        } else {
          setASetsMatchingFilters([
            ...(clinicalCasesMatchFiltersIds || []),
            ...(reportsMatchFiltersIds || []),
            ...(curationMatchFiltersIds || []),
          ]);
        }
      } catch {
        enqueueSnackbar('Could not fetch cases matching the filters, please try again.', { variant: 'error' });
      } finally {
        setDataLoading(false);
      }
    };

    getMatchingFilters();
  }, [
    areSamplelessPatients,
    dbFilters.assignedSecCurator,
    dbFilters.assignees,
    dbFilters.stage,
    dbFilters.statuses,
    dbFilters.overdueReports,
    enqueueSnackbar,
    zeroDashSdk.curation.analysisSets,
    zeroDashSdk.mtb.clinical,
    zeroDashSdk.services.reports,
  ]);

  useEffect(() => {
    if (areAllIdsInitialised) {
      getCount().then((resp) => setTotalCount(resp));
    }
  }, [getCount, areAllIdsInitialised]);

  return (
    <Root>
      <TaskSearchFilterBar
        toggled={dbFilters}
        setToggled={setDbFilters}
        emptyOptions={emptyOptions}
        getDashboardData={getDashboardData}
        counts={{ current: count, total: totalCount }}
        loading={dataLoading}
        setLoading={setDataLoading}
      />
      {!currentUser ? (
        <LoadingAnimation />
      ) : (
        <Table stickyHeader sx={{ display: 'block' }}>
          <StyledTabContentWrapper
            key={areSamplelessPatients ? 'samplesless' : 'normal'}
            fetch={fetch}
            updateCount={setCount}
            beforeMappingContent={areSamplelessPatients
              ? <SamplelessDashboardHeader />
              : <TaskDashboardHeader />}
            mapping={mapping}
          />
        </Table>
      )}
    </Root>
  );
}
