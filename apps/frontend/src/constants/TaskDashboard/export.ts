import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IBiosample } from '@/types/Analysis/Biosamples.types';
import { ITaskDashboardReport } from '@/types/Reports/Reports.types';
import { Cohorts } from '@/types/Samples/Sample.types';
import { IOverviewExport, TaskDashboardExportOptions } from '@/types/TaskDashboard/TaskDashboard.types';
import { getCaseStatus } from '@/utils/components/taskdashboard/getCaseStatus';
import { mapMtbSlidesStatus } from '@/utils/components/taskdashboard/mapMtbSlidesStatus';
import { mapReportStatus } from '@/utils/components/taskdashboard/mapReportStatus';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import mapEvent from '@/utils/functions/mapEvent';
import dayjs from 'dayjs';
import { curationExportOptions } from '../Curation/export';
import { highRiskCohorts } from '../sample';

const getOptionDate = <T extends ITaskDashboardReport | string | null | undefined>(
  option: T,
  optionKey?: 'approvedAt' | 'startedAt',
): string => {
  if (typeof option === 'string') return dayjs(option).format('DD/MM/YYYY');

  if (
    option
    && typeof option === 'object'
    && optionKey
    && optionKey in option
  ) return option[optionKey] ? dayjs(option[optionKey]).format('DD/MM/YYYY') : '';

  return '';
};

export const taskDashboardExportOptions: TaskDashboardExportOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Overview: {
    patientId: {
      label: 'Patient ID',
      selected: true,
      key: 'patientId',
    },
    sampleId: {
      label: 'Sample ID',
      selected: true,
      key: 'biosamples',
      transform: (biosamples): string => (
        getTumourBiosample(biosamples as IBiosample[] || [])?.biosampleId ?? '-'
      ),
    },
    event: {
      label: 'Event type',
      selected: true,
      key: 'sequencedEvent',
      transform: (event): string => (
        mapEvent(event as string, true)
      ),
    },
    cohort: {
      label: 'Cohort',
      selected: true,
      key: 'cohort',
      transform: (value): string => (
        value
          ? (value as string).replace(/,/g, ';')
          : ''
      ),
    },
    zero2FinalDiagnosis: {
      label: 'ZERO2 Final diagnosis',
      selected: true,
      transform: (value): string => (
        value
          ? (value as string).replace(/,/g, ';')
          : ''
      ),
      key: 'zero2FinalDiagnosis',
    },
    curationStatus: {
      label: 'Curation',
      selected: true,
      transform: (aSet): string => (aSet as IOverviewExport).pseudoStatus
      || (aSet as IOverviewExport).curationStatus,
    },
    curationStartedAt: {
      label: 'Curation start date',
      selected: true,
      key: 'curationStartedAt',
      transform: (value): string => getOptionDate(value as string | null),
    },
    curationFinalisedAt: {
      label: 'Curation end date',
      selected: true,
      key: 'curationFinalisedAt',
      transform: (value): string => getOptionDate(value as string | null),
    },
    molecularReportStatus: {
      label: 'Molecular report',
      selected: true,
      transform: (aSet): string => {
        const { cohort, molecularReport } = aSet as IOverviewExport;

        return mapReportStatus(
          'MOLECULAR_REPORT',
          molecularReport?.pseudoStatus || molecularReport?.status,
          cohort === 'Cohort 13: Germline only',
          Boolean(
            cohort && (highRiskCohorts as readonly Cohorts[]).includes(cohort),
          ),
        );
      },
    },
    molecularReportStartedAt: {
      label: 'Molecular report start date',
      selected: true,
      key: 'molecularReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'startedAt'),
    },
    molecularReportApprovedAt: {
      label: 'Molecular report approval date',
      selected: true,
      key: 'molecularReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'approvedAt'),
    },
    germlineReportStatus: {
      label: 'Germline report',
      selected: true,
      transform: (aSet): string => {
        const { cohort, germlineReport } = aSet as IOverviewExport;

        return mapReportStatus(
          'GERMLINE_REPORT',
          germlineReport?.pseudoStatus || germlineReport?.status,
          cohort === 'Cohort 13: Germline only',
          Boolean(
            cohort && (highRiskCohorts as readonly Cohorts[]).includes(cohort),
          ),
        );
      },
    },
    germlineReportStartedAt: {
      label: 'Germline report start date',
      selected: true,
      key: 'germlineReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'startedAt'),
    },
    germlineReportApprovedAt: {
      label: 'Germline report approval date',
      selected: true,
      key: 'germlineReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'approvedAt'),
    },
    mtbSlidesStatus: {
      label: 'MTB slides',
      selected: true,
      transform: (aSet): string => {
        const { clinicalData, cohort } = aSet as IOverviewExport;
        return clinicalData?.pseudoStatus || mapMtbSlidesStatus(
          clinicalData?.clinicalStatus,
          Boolean(cohort && (highRiskCohorts as readonly Cohorts[]).includes(cohort)),
          cohort === 'Cohort 13: Germline only',
        );
      },
    },
    mtbSlidesStartedAt: {
      label: 'MTB slides start date',
      selected: true,
      // key: 'curationFinalisedAt',
      transform: (aSet): string => {
        const { clinicalData, curationFinalisedAt } = aSet as IOverviewExport;
        if (
          !clinicalData
        ) return '';

        return getOptionDate(curationFinalisedAt as string | null);
      },
    },
    mtbSlidesFinalisedAt: {
      label: 'MTB slides end date',
      selected: true,
      transform: (aSet): string => getOptionDate(
        (aSet as IAnalysisSet).clinicalData?.slidesFinalisedAt,
      ),
    },
    mtbReportStatus: {
      label: 'MTB report',
      selected: true,
      transform: (aSet): string => {
        const { cohort, mtbReport, molecularReport } = aSet as IOverviewExport;

        return mapReportStatus(
          'MTB_REPORT',
          mtbReport?.pseudoStatus || mtbReport?.status,
          cohort === 'Cohort 13: Germline only',
          Boolean(
            cohort && (highRiskCohorts as readonly Cohorts[]).includes(cohort),
          ),
          molecularReport,
        );
      },
    },
    mtbReportStartedAt: {
      label: 'MTB report start date',
      selected: true,
      key: 'mtbReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'startedAt'),
    },
    mtbReportApprovedAt: {
      label: 'MTB report approval date',
      selected: true,
      key: 'mtbReport',
      transform: (value): string => getOptionDate(value as ITaskDashboardReport | null, 'approvedAt'),
    },
    caseStatus: {
      label: 'Case status',
      selected: true,
      transform: (aSet): string => {
        const {
          molecularReport,
          germlineReport,
          mtbReport,
        } = aSet as IOverviewExport;

        return getCaseStatus(
          aSet as IOverviewExport,
          molecularReport,
          germlineReport,
          mtbReport,
        );
      },
    },
    caseFinalisedAt: {
      label: 'Case end date',
      selected: true,
      key: 'caseFinalisedAt',
      transform: (value): string => getOptionDate(value as string | null),
    },
    notes: {
      label: 'Notes',
      selected: true,
      key: 'notes',
      transform: (value): string => plateToMarkdown(parseText(value as string).value).replaceAll('\n', ' ').replaceAll(',', ';'),
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Curation: {
    ...curationExportOptions,
  },
};
