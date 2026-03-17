import { corePalette } from '@/themes/colours';
import { CaseStatuses, TaskDashboardStage } from '@/types/TaskDashboard/TaskDashboard.types';
import { curationAndCaseStages, taskDashboardStages } from './stages';
import { pseudoStatusesMap } from '../Common/status';

export const caseStatuses = [
  'Sequencing',
  'Upcoming',
  'In Pipeline',
  'Ready to Start',
  'In Progress',
  'Done',
  'Withdrawn',
  'Failed',
  'On Hold',
  'N/A',
] as const;

export const caseStatusesMap: CaseStatuses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Sequencing: {
    status: 'Sequencing',
    chipProps: {
      status: 'Sequencing',
      color: corePalette.grey200,
      backgroundColor: corePalette.grey30,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Upcoming: {
    status: 'Upcoming',
    chipProps: {
      status: 'Upcoming',
      color: corePalette.grey200,
      backgroundColor: corePalette.grey30,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'In Pipeline': {
    status: 'In Pipeline',
    chipProps: {
      status: 'In Pipeline',
      color: corePalette.grey200,
      backgroundColor: corePalette.grey30,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Ready to Start': {
    status: 'Ready to Start',
    chipProps: {
      status: 'Ready',
      color: corePalette.green300,
      backgroundColor: corePalette.green10,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'In Progress': {
    status: 'In Progress',
    chipProps: {
      status: 'In Progress',
      color: corePalette.blue300,
      backgroundColor: corePalette.blue30,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Done: {
    status: 'Done',
    chipProps: {
      status: 'Done',
      color: corePalette.grey100,
      backgroundColor: corePalette.grey50,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Failed: {
    status: 'Failed',
    chipProps: {
      status: 'Failed',
      color: corePalette.red200,
      backgroundColor: corePalette.red10,
    },
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Withdrawn: {
    status: 'Withdrawn',
    chipProps: {
      status: 'Withdrawn',
      color: '#62728C',
      backgroundColor: corePalette.grey50,
    },
  },
  ...pseudoStatusesMap,
};

export const statusFilterOptions = [
  ...caseStatuses,
  'N/A',
] as const;

export const taskDashboardStatusOptions = [
  {
    name: 'Sequencing',
    value: 'Sequencing',
    allowedStages: curationAndCaseStages as readonly TaskDashboardStage[],
  },
  {
    name: 'In Pipeline',
    value: 'In Pipeline',
    allowedStages: curationAndCaseStages as readonly TaskDashboardStage[],
  },
  {
    name: 'Ready to Start',
    value: 'Ready to Start',
    allowedStages: taskDashboardStages as readonly TaskDashboardStage[],
  },
  {
    name: 'In Progress',
    value: 'In Progress',
    allowedStages: taskDashboardStages as readonly TaskDashboardStage[],
  },
  {
    name: 'Done',
    value: 'Done',
    allowedStages: taskDashboardStages as readonly TaskDashboardStage[],
  },
  {
    name: 'On Hold',
    value: 'On Hold',
    allowedStages: taskDashboardStages as readonly TaskDashboardStage[],
  },
] as const;
