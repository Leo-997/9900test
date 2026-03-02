import {
  Box,
  TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  Dispatch, JSX, SetStateAction, useState,
} from 'react';
import { v4 } from 'uuid';
import useEvidences from '@/api/useEvidences';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { trimRTEValue } from '@/utils/editor/trimRTEValue';
import CustomModal from '@/components/Common/CustomModal';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IMolecularAlterationDetail } from '../../../../../../types/MTB/MolecularAlteration.types';
import {
  DiagnosisInput,
  IFetchRecommendation, RecommendationLinkEntity,
} from '../../../../../../types/MTB/Recommendation.types';
import CustomButton from '../../../../../Common/Button';
import CustomTypography from '../../../../../Common/Typography';
import DiagnosisInputSection from '../../Modals/Components/ChangeDiagnosis/DiagnosisRecModalItem';
import TargetSection from '../Common/TargetSection';

interface IProps {
  alterations: IMolecularAlterationDetail[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  existingRec?: IFetchRecommendation;
  entity?: RecommendationLinkEntity;
  order?: number;
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
}

export default function DiagnosisRecommendationDialog({
  alterations,
  open,
  setOpen,
  existingRec,
  entity,
  order,
  onSubmitRecommendation,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion } = useClinical();
  const { demographics } = useAnalysisSet();
  const { updateRecommendationEvidence } = useEvidences();

  const [title, setTitle] = useState<string>(existingRec?.title ?? '');
  const [description, setDescription] = useState<string>(existingRec?.description ?? '');
  const [selectedTargets, setSelectedTargets] = useState<IMolecularAlterationDetail[]>(
    existingRec?.targets ?? [],
  );
  const [diagnosisInput, setDiagnosisInput] = useState<DiagnosisInput>({
    zero2FinalDiagnosis: existingRec?.zero2FinalDiagnosis,
    zero2Category: existingRec?.zero2Category,
    zero2Subcat1: existingRec?.zero2Subcat1,
    zero2Subcat2: existingRec?.zero2Subcat2,
  });

  const onCloseDialog = (): void => {
    setOpen(false);
    setTitle(existingRec?.title ?? '');
    setDescription(existingRec?.description ?? '');
    setSelectedTargets(existingRec?.targets ?? []);
    setDiagnosisInput({
      zero2Category: existingRec?.zero2Category,
      zero2Subcat1: existingRec?.zero2Subcat1,
      zero2Subcat2: existingRec?.zero2Subcat2,
      zero2FinalDiagnosis: existingRec?.zero2FinalDiagnosis,
    });
  };

  const createRecommendation = async (): Promise<void> => {
    try {
      const newId = await zeroDashSdk.mtb.recommendation.addRecommendation(clinicalVersion.id, {
        type: 'CHANGE_DIAGNOSIS',
        title,
        description: trimRTEValue(description),
        zero2Category: diagnosisInput.zero2Category,
        zero2Subcat1: diagnosisInput.zero2Subcat1,
        zero2Subcat2: diagnosisInput.zero2Subcat2,
        zero2FinalDiagnosis: diagnosisInput.zero2FinalDiagnosis,
        targets: selectedTargets?.map((t) => t.id),
        links: entity
          ? [{
            order,
            ...entity,
          }]
          : undefined,
      });
      updateRecommendationEvidence(description, newId, clinicalVersion.id);
      const newRec = await zeroDashSdk.mtb.recommendation.getRecommendationById(
        clinicalVersion.id,
        newId,
      );
      onSubmitRecommendation(newRec);
      enqueueSnackbar('Recommendation added successfully', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to add recommendation, please try again', { variant: 'error' });
    } finally {
      onCloseDialog();
    }
  };

  const updateRecommendation = async (): Promise<void> => {
    if (existingRec) {
      try {
        const newDescription = trimRTEValue(description);
        await zeroDashSdk.mtb.recommendation.updateRecommendation(
          clinicalVersion.id,
          existingRec.id,
          {
            title,
            description: newDescription,
            ...diagnosisInput,
            targets: selectedTargets.map((t) => t.id),
          },
        );
        updateRecommendationEvidence(description, existingRec.id, clinicalVersion.id);
        onSubmitRecommendation({
          ...existingRec,
          ...diagnosisInput,
          title,
          description: newDescription,
          targets: selectedTargets,
        });
        enqueueSnackbar('Recommendation updated successfully', { variant: 'success' });
        setOpen(false);
      } catch {
        enqueueSnackbar('Failed to edit recommendation, please try again', { variant: 'error' });
      }
    }
  };
  const cannotSubmit = !title || Object.entries(diagnosisInput).some((v) => v[0] !== 'zero2FinalDiagnosis' && v[1] === undefined);

  const handleOnConfirm = (): void => {
    if (existingRec) {
      updateRecommendation();
    } else {
      createRecommendation();
    }
  };

  return (
    <CustomModal
      title="Change diagnosis recommendation"
      open={open}
      onClose={(): void => setOpen(false)}
      content={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          width="100%"
          gap="16px"
        >
          <TextField
            variant="standard"
            placeholder="Title"
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
            sx={{
              width: '100%',
            }}
          />
          {alterations.length > 0 && (
            <Box width="100%">
              <TargetSection
                allTargets={alterations}
                selectedTargets={selectedTargets}
                setSelectedTargets={setSelectedTargets}
                subtitle="Select an alteration to link to this recommendation"
              />
            </Box>
          )}
          <Box display="flex" flexDirection="column" gap="12px">
            <CustomTypography variant="label">
              Histological diagnosis
            </CustomTypography>
            <CustomTypography>
              {demographics?.histologicalDiagnosis ?? '-'}
            </CustomTypography>
          </Box>
          <DiagnosisInputSection
            diagnosisInput={diagnosisInput}
            setDiagnosisInput={setDiagnosisInput}
            updatePrefilling={(zero2FinalDiagnosis: string | undefined): void => {
              setTitle(zero2FinalDiagnosis ? `Change diagnosis to ${zero2FinalDiagnosis}` : '');
            }}
          />
          <RichTextEditor
            initialText={description}
            title={(
              <CustomTypography variant="label">
                Description
              </CustomTypography>
            )}
            mode="autoSave"
            commentMode="readOnly"
            hideComments
            onSave={(val): void => setDescription(val)}
          />
        </Box>
     )}
      overrideActions={(
        <Box display="flex" flexDirection="row" gap="16px">
          <CustomButton
            variant="subtle"
            label={`Discard${existingRec ? ' changes' : ''}`}
            onClick={onCloseDialog}
          />
          {entity ? (
            <CustomButton
              variant="bold"
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={handleOnConfirm}
              disabled={cannotSubmit}
            />
          ) : (
            <CustomButton
              variant="bold"
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={(): void => {
                // if existingRec is a temp rec, remove the temp/ prefix
                onSubmitRecommendation({
                  id: `temp/${existingRec?.id.replace('temp/', '') ?? v4()}`,
                  type: 'CHANGE_DIAGNOSIS',
                  title,
                  description: trimRTEValue(description),
                  clinicalVersionId: clinicalVersion.id,
                  zero2Category: diagnosisInput.zero2Category,
                  zero2Subcat1: diagnosisInput.zero2Subcat1,
                  zero2Subcat2: diagnosisInput.zero2Subcat2,
                  zero2FinalDiagnosis: diagnosisInput.zero2FinalDiagnosis,
                  targets: selectedTargets,
                });
                onCloseDialog();
              }}
              disabled={cannotSubmit}
            />
          )}
        </Box>
      )}
    />
  );
}
