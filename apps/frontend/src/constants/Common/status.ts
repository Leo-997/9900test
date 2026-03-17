import { corePalette } from '@/themes/colours';
import { ICurrentCaseStatus } from '@/types/TaskDashboard/TaskDashboard.types';

export const pseudoStatuses = [
  'N/A',
  'On Hold',
] as const;

export const onHoldStatus: ICurrentCaseStatus = {
  status: 'On Hold',
  chipProps: {
    status: 'On Hold',
    color: corePalette.red300,
    backgroundColor: corePalette.red10,
  },
};

export const naStatus: ICurrentCaseStatus = {
  status: 'N/A',
  chipProps: {
    status: 'N/A',
    color: corePalette.grey200,
    backgroundColor: corePalette.grey30,
    background: `repeating-linear-gradient(45deg, ${corePalette.grey50}, ${corePalette.grey50} 3px, ${corePalette.grey30} 3px, ${corePalette.grey30} 6px)`,
  },
};

export const pseudoStatusesMap = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'On Hold': onHoldStatus,
  'N/A': naStatus,
};
