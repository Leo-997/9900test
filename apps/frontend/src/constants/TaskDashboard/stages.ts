import { ISelectOption } from '@/types/misc.types';
import { TaskDashboardStage } from '@/types/TaskDashboard/TaskDashboard.types';

export const reportsAndSlidesStages = [
  'MOLECULAR_REPORT',
  'MTB_REPORT',
  'GERMLINE_REPORT',
  'MTB_SLIDES',
] as const;

export const curationAndCaseStages = [
  'CURATION',
  'CASE_STATUS',
] as const;

export const taskDashboardStages = [
  curationAndCaseStages[0],
  ...reportsAndSlidesStages,
  curationAndCaseStages[1],
] as const;

export const stageStatuses = [
  'On Hold',
  'Remove Hold',
  'N/A',
  'Done',
] as const;

export const taskDashboardStageOptions: ISelectOption<TaskDashboardStage>[] = [
  { name: 'Curation', value: 'CURATION' },
  { name: 'Molecular Report', value: 'MOLECULAR_REPORT' },
  { name: 'Germline Report', value: 'GERMLINE_REPORT' },
  { name: 'MTB Report', value: 'MTB_REPORT' },
  { name: 'MTB Slides', value: 'MTB_SLIDES' },
  { name: 'Case Status', value: 'CASE_STATUS' },
] as const;
