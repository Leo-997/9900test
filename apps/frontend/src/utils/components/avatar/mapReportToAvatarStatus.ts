import { AvatarStatus } from '@/types/Avatar.types';
import { ApprovalStatus } from '@/types/Reports/Approvals.types';

export const mapReportToAvatarStatus = (status: ApprovalStatus): AvatarStatus => {
  switch (status) {
    case 'approved':
      return 'done';
    case 'pending':
      return 'progress';
    default:
      return 'ready';
  }
};
