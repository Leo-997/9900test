import { IDrugMetadata } from '@/types/Drugs/Drugs.types';
import { trimRTEValue } from '@/utils/editor/trimRTEValue';
import getTierString from '@/utils/functions/getTierString';
import {
  Box,
  Dialog as MuiDialog,
  styled,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Dispatch, ReactNode, SetStateAction, useMemo, useState, type JSX } from 'react';
import { v4 } from 'uuid';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useTherapyRecommendation } from '../../../../../../contexts/TherapyRecommendationContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import { IFetchRecommendation, TierType } from '../../../../../../types/MTB/Recommendation.types';
import NavBar from '../../../../NavBar/Modal/NavBar';
import Footer from '../../Modals/Components/Footer';
import Header from '../../Modals/Components/Header';
import RecommendationLeftPanel from './RecommendationLeftPanel';
import RecommendationRightPanel from './RecommendationRightPanel';

const Dialog = styled(MuiDialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    width: '100vw',
    height: '100vh',
    maxWidth: '100vw',
    maxHeight: '100vh',
    overflow: 'hidden',
    borderRadius: '0px',
    margin: '0px',
    padding: '0px',
    backgroundColor: theme.colours.core.grey10,
  },
}));

interface IProps {
  alterations: IMolecularAlterationDetail[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  returnToTitle?: string;
  order?: number;
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
}

export default function TherapyRecommendationDialog({
  alterations,
  open,
  setOpen,
  onSubmitRecommendation,
  returnToTitle,
  order,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    getSlides,
    clinicalVersion,
  } = useClinical();
  const {
    entity,
    title,
    setTitle,
    description,
    tier,
    setTier,
    existingRec,
    resetTherapy,
    addRecommendation,
    updateRecommendation,
    targets,
    selectedTherapyDrugs,
    selectedTherapyTrials,
    chemotherapy,
    radiotherapy,
    selectedEvidence,
    updateTitlePrefilling,
  } = useTherapyRecommendation();

  const submitDisabled = useMemo<boolean>(
    () => title.length === 0
    || ((!tier.level || Object.entries(tier.class).every((c) => !c[1])) && !tier.noTier)
    || (targets.length < 1 && alterations.length > 0)
    || selectedTherapyDrugs.length < 1
    || selectedTherapyDrugs.some((drug) => drug.class === null),
    [alterations.length, selectedTherapyDrugs, targets.length, tier, title.length],
  );
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);

  const handleClose = (): void => {
    resetTherapy();
    getSlides();
    setOpen(false);
  };

  const handleAddRecommendation = async (): Promise<string | null> => {
    try {
      const newId = await addRecommendation(
        entity
          ? [{
            order,
            ...entity,
          }]
          : undefined,
      );
      if (newId) {
        const newRec = await zeroDashSdk.mtb.recommendation.getRecommendationById(
          clinicalVersion.id,
          newId,
        );
        onSubmitRecommendation(newRec);

        handleClose();
        enqueueSnackbar('Recommendation added successfully', { variant: 'success' });

        return newId;
      }

      return null;
    } catch {
      enqueueSnackbar('Error adding recommendation, please try again', { variant: 'error' });
      return null;
    }
  };

  const handleUpdateRecommendation = async (): Promise<void> => {
    try {
      const newId = await updateRecommendation();
      if (newId) {
        const newRec = await zeroDashSdk.mtb.recommendation.getRecommendationById(
          clinicalVersion.id,
          newId,
        );
        onSubmitRecommendation(newRec);

        handleClose();
        enqueueSnackbar('Updated recommendation successfully', { variant: 'success' });
      }
    } catch (err) {
      enqueueSnackbar('Could not update recommendation, please try again', { variant: 'error' });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    setSubmitLoading(true);
    if (entity) {
      if (existingRec) {
        await handleUpdateRecommendation();
      } else {
        await handleAddRecommendation();
      }
    } else {
      // if existingRec is a temp rec, remove the temp/ prefix
      onSubmitRecommendation({
        id: `temp/${existingRec?.id.replace('temp/', '') ?? v4()}`,
        clinicalVersionId: clinicalVersion.id,
        type: 'THERAPY',
        title,
        tier: getTierString(tier),
        description: trimRTEValue(description),
        targets,
        therapy: {
          id: 'temp-therapy',
          chemotherapy: chemotherapy.includeOption,
          radiotherapy: radiotherapy.includeOption,
          chemotherapyNote: chemotherapy.note,
          radiotherapyNote: radiotherapy.note,
          drugs: selectedTherapyDrugs.map((selectedTherapyDrug) => ({
            id: selectedTherapyDrug.id,
            // classes will not be null if the submit button can be clicked
            class: selectedTherapyDrug.class as IDrugMetadata,
            externalDrugVersionId: selectedTherapyDrug.drug
              ? selectedTherapyDrug.drug.versionId
              : null,
            externalDrug: selectedTherapyDrug.drug,
          })),
          trials: selectedTherapyTrials,
        },
        evidence: selectedEvidence,
      });
      handleClose();
    }
    setSubmitLoading(false);
  };

  const getTooltipText = (): NonNullable<ReactNode> => {
    const text: string[] = [];
    if (title.length === 0) text.push('a recommendation title');

    if ((!tier.level || Object.entries(tier.class).every((c) => !c[1])) && !tier.noTier) text.push('a therapy tier, or "No tier" option');

    if (targets.length < 1 && alterations.length > 0) text.push('at least one target');

    if (selectedTherapyDrugs.length < 1) text.push('at least one drug class');

    if (selectedTherapyDrugs.some((drug) => drug.class === null)) {
      text.push('no unspecified drug classes');
    }

    return text.length > 0 ? (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
      >
        You must have the following before submitting:
        <ul>
          {text.map((t) => (
            <li key={t}>
              {t}
            </li>
          ))}
        </ul>
      </Box>
    ) : '';
  };

  return (
    <Dialog
      key={`dialog-${open}`}
      open={open}
      onClose={handleClose}
      disableEscapeKeyDown
    >
      <NavBar
        status={clinicalVersion.status}
        returnTo={returnToTitle}
        returnFn={handleClose}
      />
      <Header
        title={(
          <TextField
            variant="standard"
            sx={{ width: '100%' }}
            placeholder="Therapy Recommendation Title"
            slotProps={{
              input: {
                sx: {
                  fontSize: '24px',
                  fontWeight: 'medium',
                },
              },
            }}
            value={title}
            onChange={(e): void => setTitle(e.target.value)}
          />
        )}
        tier={tier}
        setTier={(newTier: TierType): void => {
          updateTitlePrefilling(
            selectedTherapyDrugs,
            chemotherapy.includeOption,
            radiotherapy.includeOption,
            targets,
            newTier,
          );
          setTier(newTier);
        }}
      />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        width="100%"
        // 240px is the height sum of NavBar, Header, and Footer
        height="calc(100vh - 240px)"
      >
        <RecommendationLeftPanel alterations={alterations} />
        <RecommendationRightPanel />
      </Box>
      <Footer
        confirmLabel={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
        cancelLabel={`Discard${existingRec ? ' changes' : ''}`}
        confirmDisabled={submitDisabled}
        confirmLoading={submitLoading}
        tooltipText={getTooltipText()}
        handleConfirm={handleSubmit}
        handleCancel={handleClose}
      />
    </Dialog>
  );
}
