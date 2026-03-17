import { corePalette } from '@/themes/colours';
import { ApprovalStatuses } from '../../types/Reports/Approvals.types';

export const approvalStatuses = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
] as const;

export const approvalStatusMap: ApprovalStatuses = {
  pending: {
    status: 'pending',
    chips: [
      {
        chipProps: {
          status: 'Pending',
          color: corePalette.blue300,
          backgroundColor: corePalette.blue30,
        },
      },
    ],
  },
  approved: {
    status: 'approved',
    chips: [
      {
        chipProps: {
          status: 'Approved',
          color: corePalette.grey100,
          backgroundColor: corePalette.grey50,
        },
      },
    ],
  },
  rejected: {
    status: 'rejected',
    chips: [
      {
        chipProps: {
          status: 'Rejected',
          color: corePalette.red200,
          backgroundColor: corePalette.red10,
        },
      },
    ],
  },
  cancelled: {
    status: 'cancelled',
    chips: [
      {
        chipProps: {
          status: 'Cancelled',
          color: '#62728C',
          backgroundColor: corePalette.grey50,
        },
      },
    ],
  },
};
