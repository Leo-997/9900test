import { pseudoStatuses } from '@/constants/Common/status';
import {
  stageStatuses, taskDashboardStageOptions, taskDashboardStages,
} from '@/constants/TaskDashboard/stages';
import { caseStatuses, statusFilterOptions } from '@/constants/TaskDashboard/status';
import { DashboardExportOptions, OverviewExportOptions } from '../Search.types';
import { IAnalysisSet } from '../Analysis/AnalysisSets.types';
import { ITaskDashboardReport } from '../Reports/Reports.types';

// STATUS TYPES
export type CaseStatus = typeof caseStatuses[number];
export type PseudoStatus = typeof pseudoStatuses[number];

export type NextCaseStatus = {
  status: CaseStatus;
  label: string;
}

export interface ICurrentCaseStatus {
  status: CaseStatus;
  chipProps: {
    status: string;
    color: string;
    backgroundColor: string;
    background?: string;
  };
}

export type CaseStatuses = {
  [key in CaseStatus]: ICurrentCaseStatus;
}

export type TaskDashboardStatuses = typeof statusFilterOptions[number];

export type DashboardRowType = 'main' | 'related' | 'readOnly';

// STAGE TYPES
export type StageName = 'Curation' | 'Molecular Report' | 'Germline Report' | 'MTB Report' | 'MTB Slides' | 'Case Status';
export type TaskDashboardStage = typeof taskDashboardStages[number];

export type StageStatus = typeof stageStatuses[number];

// FILTER TYPES
export type StatusFilter = {
  stage: TaskDashboardStage;
  status: TaskDashboardStatuses;
}

export type AssigneesFilter = {
  assignee: string;
  stage?: TaskDashboardStage;
}

export interface ITaskDashboardFilters {
  search?: string[];
  stage?: TaskDashboardStage;
  statuses?: TaskDashboardStatuses[];
  assignees?: string[];
  study?: string[];
  eventType?: string[];
  cohort?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  expedited?: boolean;
  activeCases?: boolean;
  overdueReports?: boolean;
  assignedSecCurator?: string;
  enrolledOnlyCases?: boolean;
  withdrawnCases?: boolean;
}

export const taskDashboardStageLabels: Record<string, string> = {
  CURATION: 'Curation',
  MOLECULAR_REPORT: 'Molecular Report',
  MTB_REPORT: 'MTB Report',
  GERMLINE_REPORT: 'Germline Report',
  MTB_SLIDES: 'MTB Slides',
  CASE_STATUS: 'Case Status',
};

export type TaskDashboardStageOptions = typeof taskDashboardStageOptions[number];

// EXPORT TYPES
export type TaskDashboardExportOptions = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Overview: OverviewExportOptions;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Curation: DashboardExportOptions;
}

export interface IOverviewExport extends IAnalysisSet {
  molecularReport: ITaskDashboardReport | null;
  germlineReport: ITaskDashboardReport | null;
  mtbReport: ITaskDashboardReport | null;
  notes: string;
}
