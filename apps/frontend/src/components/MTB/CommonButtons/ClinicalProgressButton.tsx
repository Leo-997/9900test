import { useCallback, useEffect, useState, type JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { Tooltip } from '@mui/material';
import { INextClinicalReviewStatus, INextClinicalStatus } from '../../../types/MTB/ClinicalStatus.types';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useUser } from '../../../contexts/UserContext';
import CustomButton from '../../Common/Button';
import { clinicalReviewStatuses } from '../../../constants/MTB/navigation';
import { IReviewWithUser } from '../../../types/MTB/MTB.types';

export default function ClinicalProgressButton(): JSX.Element {
  const { currentUser } = useUser();
  const {
    clinicalStatus,
    clinicalVersion,
    isAssignedCurator,
    isAssignedClinician,
    updateReviewStatus,
    updateClinicalVersionStatus,
  } = useClinical();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [nextClinicalStatus, setNextClinicalStatus] = useState<INextClinicalStatus | null>(null);
  const [activeReview, setActiveReview] = useState<IReviewWithUser | null>(null);
  const [nextReviewStatus, setNextReviewStatus] = useState<INextClinicalReviewStatus | null>(null);
  const [updateState, setUpdateState] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [disabledTooltip, setDisabledTooltip] = useState<string>('');

  const canProgressStatus = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  // returns all clinical statuses that the user can progress to
  // if there are no currently active reviews and the user has
  // the role required to update
  const getNextClinicalStatuses = useCallback(() => {
    const { nextStatuses } = clinicalStatus;
    const authorisedNextStatuses: INextClinicalStatus[] = [];
    if (nextStatuses) {
      nextStatuses.forEach((nextStatus) => {
        if (canProgressStatus) {
          authorisedNextStatuses.push(nextStatus);
        }
      });
    }
    return authorisedNextStatuses;
  }, [canProgressStatus, clinicalStatus]);

  const updateToNextClinicalStatus = useCallback(async () => {
    if (nextClinicalStatus) {
      await updateClinicalVersionStatus(nextClinicalStatus.status);
    }
  }, [nextClinicalStatus, updateClinicalVersionStatus]);

  const getActiveReview = useCallback(() => {
    const firstActiveReview = clinicalVersion.reviewers.find(
      (review) => {
        const isUser = review.user?.id === currentUser?.id;
        const { canProgress } = clinicalReviewStatuses[review.status];
        const { nextStatus } = clinicalReviewStatuses[review.status];
        if (isUser && canProgress && nextStatus) {
          return canProgressStatus;
        }
        return false;
      },
    );
    return firstActiveReview ?? null;
  }, [canProgressStatus, clinicalVersion.reviewers, currentUser?.id]);

  // This function is built with the assumption that the current user
  // can be assigned to multiple reviews at the same time, for whatever reason
  const getNextReviewStatus = useCallback(() => {
    if (activeReview) {
      return clinicalReviewStatuses[activeReview.status].nextStatus ?? null;
    }
    return null;
  }, [activeReview]);

  const updateToNextReviewStatus = useCallback(async () => {
    if (nextReviewStatus && activeReview?.group) {
      await updateReviewStatus(activeReview?.group, nextReviewStatus.status);
    }
  }, [activeReview?.group, nextReviewStatus, updateReviewStatus]);

  const handleButtonClick = (): void => {
    setIsLoading(true);
    setUpdateState(true);
  };

  const getLabel = (): string => {
    if (nextReviewStatus) return nextReviewStatus.label;
    if (nextClinicalStatus) return nextClinicalStatus.label;

    if (clinicalVersion.reviewers.some((review) => review.status === 'In Progress')) return 'Review in Progress';

    return clinicalStatus.status;
  };

  /**
   *  Conditions for disabling:
   *  1. Don't have permission to proceed
   *  2. (removed) Have fewer than 2 completed reviews and the next status is a completed status
   *  3. (removed) Review is in progress
   */
  useEffect(() => {
    setDisabledTooltip('');
    setDisabled(false);
    // Cannot progress to the next status nor to the next review status
    if (!nextClinicalStatus && !nextReviewStatus) {
      setDisabledTooltip('You do not have permission to progress');
      setDisabled(true);
    }
  }, [clinicalVersion.reviewers, nextClinicalStatus, nextReviewStatus]);

  useEffect(() => {
    async function updateClinicalStatus(): Promise<void> {
      if (nextReviewStatus) {
        if (nextReviewStatus.modal) {
          setModalOpen(true);
        } else {
          await updateToNextReviewStatus();
        }
      } else if (nextClinicalStatus) {
        if (nextClinicalStatus.modal) {
          setModalOpen(true);
        } else {
          await updateToNextClinicalStatus();
        }
      }

      setUpdateState(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
    if (updateState) {
      setUpdateState(false);
      updateClinicalStatus();
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [
    updateState,
    nextClinicalStatus,
    nextReviewStatus,
    updateToNextClinicalStatus,
    updateToNextReviewStatus,
  ]);

  useEffect(() => {
    const nextStatuses = getNextClinicalStatuses();
    const currentActiveReview = getActiveReview();
    const nextStatusReview = getNextReviewStatus();
    if (nextStatuses.length === 1) {
      setNextClinicalStatus(nextStatuses[0]);
    } else {
      setNextClinicalStatus(null);
    }
    setActiveReview(currentActiveReview);
    setNextReviewStatus(nextStatusReview);
  }, [
    getNextClinicalStatuses,
    getActiveReview,
    getNextReviewStatus,
  ]);

  return (
    <>
      <Tooltip
        title={disabledTooltip}
        placement="bottom"
      >
        <span>
          <CustomButton
            variant="bold"
            size="small"
            label={getLabel()}
            disabled={isLoading || disabled}
            onClick={handleButtonClick}
            loading={isLoading}
          />
        </span>
      </Tooltip>
      {nextClinicalStatus?.modal && !nextReviewStatus && (
        <nextClinicalStatus.modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
        />
      )}
      {nextReviewStatus?.modal && (
        <nextReviewStatus.modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          activeReview={activeReview}
        />
      )}
    </>
  );
}
