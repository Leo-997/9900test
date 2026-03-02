/* eslint-disable @typescript-eslint/naming-convention */
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { styled } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ChevronDown } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { useCuration } from '../../contexts/CurationContext';
import {
  CurationStatus, HtsStatus, INextStatus, NextCurationStatus,
  SecondaryCurationStatus,
} from '../../types/Samples/Sample.types';
import CustomButton from '../Common/Button';
import CurationProgressMenu from './CurationProgressMenu';

interface IStylingProps {
  menuOpen: boolean;
  multiState: boolean;
}

const Button = styled(CustomButton)<IStylingProps>(({ menuOpen, multiState }) => {
  let borderRadius = '24px';
  if (multiState) borderRadius = '24px 0px 0px 24px';
  if (menuOpen) borderRadius = '24px 0px 0px 0px';

  return {
    minWidth: '250px',
    padding: '12px 10px',
    margin: '0px',
    height: '48px',
    borderRadius,
  };
});

const ArrowButton = styled(CustomButton)<IStylingProps>(({ menuOpen }) => ({
  height: '48px',
  width: '48px',
  minWidth: '0px',
  padding: '0px',
  marginRight: '0px',
  borderRadius: menuOpen ? '0px 24px 0px 0px' : '0px 24px 24px 0px',
}));

const useStyles = makeStyles(() => ({
  container: {
    marginRight: '24px',
  },
}));

export default function CurationProgressButton(): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const {
    allFlagsCorrected,
    curationStatus: currentCurationStatus,
    secondaryCurationStatus,
    htsStatus,
    isAssignedCurator,
    updateCurationStatus,
    updateSecondaryCurationStatus,
    updateHtsStatus,
  } = useCuration();
  const { htsCultures, analysisSet } = useAnalysisSet();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [updateState, setUpdateState] = useState<boolean>(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [nextCurationStatus, setNextCurationStatus] = useState<NextCurationStatus | null>(null);
  const [
    nextSecondaryCurationStatus,
    setNextSecondaryCurationStatus,
  ] = useState<INextStatus<SecondaryCurationStatus> | null>(null);
  const [
    nextHtsStatus,
    setNextHtsStatus,
  ] = useState<INextStatus<HtsStatus> | null>(null);

  const buttonRef = useRef<HTMLDivElement>(null);

  // Admins can progress any status
  // Curators can ONLY do Ready To Start > In Progress > Curation Done for assigned samples
  const canProgressStatusAdmin = useIsUserAuthorised('curation.status.write');
  const canProgressStatus = useIsUserAuthorised('curation.sample.assigned.write', isAssignedCurator);
  const canProgressHtsStatus = useIsUserAuthorised('curation.sample.hts.write', isAssignedCurator);

  const getNextCurationStatuses = useCallback((): NextCurationStatus[] => {
    const scopeMap: Record<CurationStatus, boolean> = {
      Sequencing: canProgressStatusAdmin,
      'In Pipeline': canProgressStatusAdmin,
      'Ready to Start': canProgressStatusAdmin,
      'In Progress': canProgressStatus || canProgressStatusAdmin,
      Done: canProgressStatus || canProgressStatusAdmin,
      Failed: canProgressStatus || canProgressStatusAdmin,
      Withdrawn: canProgressStatus || canProgressStatusAdmin,
    };

    const nextStatuses = currentCurationStatus?.nextStatuses;
    const authorisedNextStatuses: NextCurationStatus[] = [];
    if (
      nextStatuses
      && !secondaryCurationStatus?.canProgress(analysisSet)
    ) {
      nextStatuses.forEach((nextStatus) => {
        if (scopeMap[nextStatus.status]) {
          authorisedNextStatuses.push(nextStatus);
        }
      });
    }
    return authorisedNextStatuses;
  }, [
    analysisSet,
    canProgressStatus,
    canProgressStatusAdmin,
    currentCurationStatus?.nextStatuses,
    secondaryCurationStatus,
  ]);

  const getNextSecondaryCurationStatus = useCallback(() => {
    if (
      secondaryCurationStatus?.canProgress(analysisSet)
      && secondaryCurationStatus.nextStatus
      && (canProgressStatus || canProgressStatusAdmin)
    ) {
      return secondaryCurationStatus.nextStatus;
    }

    return null;
  }, [analysisSet, secondaryCurationStatus, canProgressStatus, canProgressStatusAdmin]);

  const getNextHtsStatus = useCallback(() => {
    if (
      htsStatus?.canProgress(htsCultures)
      && htsStatus.nextStatus
      && (canProgressHtsStatus || canProgressStatusAdmin)
    ) {
      return htsStatus.nextStatus;
    }

    return null;
  }, [htsStatus, canProgressHtsStatus, canProgressStatusAdmin, htsCultures]);

  const classes = useStyles(
    {
      menuOpen: Boolean(menuAnchorEl),
      multiState: getNextCurationStatuses().length > 1,
    },
  );

  const buttonDisabled = (): boolean => (
    !allFlagsCorrected
      || (
        getNextCurationStatuses().length === 0
        && !getNextSecondaryCurationStatus()
        && !getNextHtsStatus()
      )
  );

  const updateToNextState = useCallback(async () => {
    if (nextCurationStatus) {
      await updateCurationStatus(nextCurationStatus.status);
      if (nextCurationStatus.secondaryStatus) {
        updateSecondaryCurationStatus(nextCurationStatus.secondaryStatus);
      }
    }
  }, [nextCurationStatus, updateCurationStatus, updateSecondaryCurationStatus]);

  const updateToNextSecondaryState = useCallback(async () => {
    if (nextSecondaryCurationStatus) {
      await updateSecondaryCurationStatus(nextSecondaryCurationStatus.status);
    }
  }, [nextSecondaryCurationStatus, updateSecondaryCurationStatus]);

  const updateToNextHtsState = useCallback(async () => {
    if (nextHtsStatus) {
      await updateHtsStatus(nextHtsStatus.status);
    }
  }, [nextHtsStatus, updateHtsStatus]);

  const handleButtonClick = async (): Promise<void> => {
    setIsLoading(true);
    setUpdateState(true);
  };

  useEffect(() => {
    async function updateStatus(): Promise<void> {
      if (!allFlagsCorrected) {
        enqueueSnackbar('New flags for correction have been submitted. Please review before proceeding', {
          variant: 'warning',
        });
        return;
      }
      if (nextCurationStatus) {
        if (nextCurationStatus.modal) {
          setModalOpen(true);
        } else {
          await updateToNextState();
        }
      } else if (nextSecondaryCurationStatus) {
        if (nextSecondaryCurationStatus.modal) {
          setModalOpen(true);
        } else {
          await updateToNextSecondaryState();
        }
      } else if (nextHtsStatus) {
        if (nextHtsStatus.modal) {
          setModalOpen(true);
        } else {
          await updateToNextHtsState();
        }
      } else {
        setMenuAnchorEl(buttonRef.current);
      }
      setUpdateState(false);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    if (updateState) {
      setUpdateState(false);
      updateStatus();
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [
    updateState,
    allFlagsCorrected,
    nextCurationStatus,
    nextSecondaryCurationStatus,
    nextHtsStatus,
    enqueueSnackbar,
    updateToNextState,
    updateToNextSecondaryState,
    updateToNextHtsState,
  ]);

  useEffect(() => {
    const nextStatuses = getNextCurationStatuses();
    if (nextStatuses.length === 1) {
      setNextCurationStatus(nextStatuses[0]);
    } else {
      setNextCurationStatus(null);
    }

    setNextSecondaryCurationStatus(getNextSecondaryCurationStatus());
    setNextHtsStatus(getNextHtsStatus());
  }, [getNextCurationStatuses, getNextSecondaryCurationStatus, getNextHtsStatus]);

  const getLabel = (): string | undefined => {
    if (nextCurationStatus) {
      return nextCurationStatus.label;
    }
    if (nextSecondaryCurationStatus) {
      return nextSecondaryCurationStatus.label;
    }
    if (nextHtsStatus) {
      return nextHtsStatus.label;
    }
    if (getNextCurationStatuses().length > 1) {
      return 'Proceed to...';
    }
    if (secondaryCurationStatus?.canProgress(analysisSet)) {
      return 'Secondary Curation in Progress';
    }
    return currentCurationStatus?.status;
  };

  return (
    <div ref={buttonRef} className={classes.container}>
      <Button
        menuOpen={Boolean(menuAnchorEl)}
        multiState={getNextCurationStatuses().length > 1}
        variant="bold"
        label={getLabel()}
        disabled={isLoading || buttonDisabled()}
        onClick={handleButtonClick}
        loading={isLoading}
      />
      {getNextCurationStatuses().length > 1 && (
        <ArrowButton
          variant="bold"
          label={(
            <ChevronDown />
          )}
          disabled={isLoading}
          onClick={(): void => setMenuAnchorEl(buttonRef.current)}
          menuOpen={Boolean(menuAnchorEl)}
          multiState={getNextCurationStatuses().length > 1}
          loading={isLoading}
        />
      )}
      <CurationProgressMenu
        anchorEl={menuAnchorEl}
        setAnchorEl={setMenuAnchorEl}
        setNextCurationStatus={setNextCurationStatus}
        options={getNextCurationStatuses()}
      />
      {nextCurationStatus?.modal && (
        <nextCurationStatus.modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          updateToNextState={updateToNextState}
        />
      )}
      {nextSecondaryCurationStatus?.modal && (
        <nextSecondaryCurationStatus.modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          updateToNextState={updateToNextSecondaryState}
        />
      )}
      {nextHtsStatus?.modal && (
        <nextHtsStatus.modal
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          updateToNextState={updateToNextHtsState}
        />
      )}
    </div>
  );
}
