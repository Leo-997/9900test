import { Dispatch, ElementType, SetStateAction } from 'react';
import { IChipProps } from '../Samples/Sample.types';
import { IReviewWithUser } from './MTB.types';

export type ClinicalStatus =
  | 'Ready to Start'
  | 'In Progress'
  | 'Done'
  | 'N/A';

export type ClinicalReviewStatus =
  | 'Assigned'
  | 'Ready for Review'
  | 'In Progress'
  | 'Completed';

export interface INextClinicalStatus {
  status: ClinicalStatus;
  label: string;
  altLabel?: string;
  modal?: ElementType<{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
  }>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface INextClinicalReviewStatus {
  status: ClinicalReviewStatus;
  label: string;
  modal?: ElementType<{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    activeReview: IReviewWithUser | null;
  }>;
}

export interface ICurrentClinicalStatus {
  status: ClinicalStatus;
  chips: {
    chipProps: IChipProps;
  }[];
  readonly: boolean;
  canAskToReview: boolean;
  nextStatuses: INextClinicalStatus[];
  disabledInCuration: boolean;
}

export interface ICurrentClinicalReviewStatus {
  status: ClinicalReviewStatus;
  canProgress: boolean;
  nextStatus?: INextClinicalReviewStatus;
  readonly: boolean;
}
