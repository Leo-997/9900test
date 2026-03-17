import { corePalette } from '@/themes/colours';
import FinaliseConfirmationModal from '../../components/MTB/Views/Components/Modals/FinaliseConfirmationModal';
import ReviewConfirmationModal from '../../components/MTB/Views/Components/Modals/ReviewConfirmationModal';
import {
  ClinicalReviewStatus, ClinicalStatus, ICurrentClinicalReviewStatus, ICurrentClinicalStatus,
} from '../../types/MTB/ClinicalStatus.types';
import { naStatus } from '../Common/status';

type ClinicalStatuses = {
  [key in ClinicalStatus]: ICurrentClinicalStatus;
}

type ClinicalReviewStatuses = {
  [key in ClinicalReviewStatus]: ICurrentClinicalReviewStatus;
}

export const clinicalStatuses: ClinicalStatuses = {
  'Ready to Start': {
    status: 'Ready to Start',
    chips: [
      {
        chipProps: {
          status: 'Ready to Start',
          color: corePalette.green300,
          backgroundColor: corePalette.green10,
        },
      },
    ],
    readonly: true,
    canAskToReview: false,
    nextStatuses: [
      {
        status: 'In Progress',
        label: 'Ready to Start',
      },
    ],
    disabledInCuration: false,
  },
  'In Progress': {
    status: 'In Progress',
    chips: [
      {
        chipProps: {
          status: 'In Progress',
          color: corePalette.blue300,
          backgroundColor: corePalette.blue30,
        },
      },
    ],
    readonly: false,
    canAskToReview: true,
    nextStatuses: [
      {
        status: 'Done',
        label: 'Finalise',
        modal: FinaliseConfirmationModal,
      },
    ],
    disabledInCuration: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Done: {
    status: 'Done',
    chips: [
      {
        chipProps: {
          status: 'Done',
          color: corePalette.grey100,
          backgroundColor: corePalette.grey50,
        },
      },
    ],
    readonly: true,
    canAskToReview: false,
    nextStatuses: [],
    disabledInCuration: true,
  },
  'N/A': {
    status: 'N/A',
    chips: [naStatus],
    readonly: true,
    canAskToReview: false,
    nextStatuses: [],
    disabledInCuration: false,
  },
};

export const clinicalReviewStatuses: ClinicalReviewStatuses = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Assigned: {
    status: 'Assigned',
    canProgress: false,
    nextStatus: {
      status: 'Ready for Review',
      label: 'Assign for Review',
    },
    readonly: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'Ready for Review': {
    status: 'Ready for Review',
    canProgress: true,
    nextStatus: {
      status: 'In Progress',
      label: 'Start Review',
    },
    readonly: true,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'In Progress': {
    status: 'In Progress',
    canProgress: true,
    nextStatus: {
      status: 'Completed',
      label: 'Complete Review',
      modal: ReviewConfirmationModal,
    },
    readonly: false,
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Completed: {
    status: 'Completed',
    canProgress: false,
    readonly: true,
  },
};
