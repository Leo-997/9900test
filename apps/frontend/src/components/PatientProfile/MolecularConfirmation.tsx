import { Grid, TextField } from '@mui/material';
import {
  useCallback, useMemo, useRef, useState, type JSX,
} from 'react';
import { useSnackbar } from 'notistack';
import { corePalette } from '@/themes/colours';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { changeOrRefinementOptions, defaultMolecularConfirmation, pathologistAgreementOptions } from '@/constants/Curation/MolecularConfirmation';
import { ChangeOrRefinementOption, IMolecularConfirmation, PathologistAgreementOption } from '@/types/MolecularConfirmation.types';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import CustomTypography from '../Common/Typography';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';
import { IRTERef, RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';
import CustomButton from '../Common/Button';
import { emptyEditorState } from '../plate-ui/Editor/editor-states';

interface IProps {
  molecularConfirmation: IMolecularConfirmation,
}

export default function MolecularConfirmation({
  molecularConfirmation,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { setMolecularConfirmation, analysisSet } = useAnalysisSet();
  const canEdit = useIsUserAuthorised('curation.sample.write');

  const [
    newMolecularConfirmation,
    setNewMolecularConfirmation,
  ] = useState<IMolecularConfirmation>({ ...molecularConfirmation });
  const hasUpdate = useMemo(
    () => Object.entries(molecularConfirmation).some(([k, v]) => (
      k.includes('Notes')
        ? plateToMarkdown(parseText(newMolecularConfirmation[k] || '').value) !== plateToMarkdown(parseText(v || '').value)
        : newMolecularConfirmation[k] !== v)),
    [molecularConfirmation, newMolecularConfirmation],
  );

  const changeOrRefinementNotesEditorRef = useRef<IRTERef | null>(null);
  const pathologistAgreementNotesEditorRef = useRef<IRTERef | null>(null);

  const handleSave = useCallback((): void => {
    zeroDashSdk.curation.molecularConfirmation
      .updateMolecularConfirmation(newMolecularConfirmation, analysisSet.analysisSetId)
      .then(() => setMolecularConfirmation({ ...newMolecularConfirmation }))
      .catch(() => enqueueSnackbar('Cannot update molecular confirmation, please try again.', { variant: 'error' }));
  }, [
    analysisSet.analysisSetId,
    enqueueSnackbar,
    newMolecularConfirmation,
    setMolecularConfirmation,
    zeroDashSdk.curation.molecularConfirmation,
  ]);

  return (
    <Grid
      container
      direction="column"
      bgcolor={corePalette.white}
      padding="24px"
      marginBottom="64px"
      borderRadius="8px"
      spacing={3}
      size={12}
    >
      <CustomTypography variant="titleRegular" fontWeight="medium">
        Molecular Confirmation
      </CustomTypography>
      <Grid
        container
        direction="column"
        spacing={1}
      >
        <CustomTypography variant="titleSmall" fontWeight="medium">
          Did the molecular findings suggest a change or refinement in histological diagnosis?
        </CustomTypography>
        <AutoWidthSelect
          options={changeOrRefinementOptions.map((o) => ({ name: o, value: o }))}
          value={newMolecularConfirmation.changeOrRefinement}
          onChange={(e): void => {
            if (e.target.value === 'No change required') {
              setNewMolecularConfirmation({ ...defaultMolecularConfirmation });
            } else {
              setNewMolecularConfirmation((prev) => ({
                ...prev,
                changeOrRefinement: e.target.value as ChangeOrRefinementOption,
              }));
            }
          }}
          overrideReadonlyMode={!canEdit}
          sx={{ width: '300px' }}
        />
        {newMolecularConfirmation.changeOrRefinement !== 'No change required' && (
          <Grid
            bgcolor={corePalette.grey10}
            padding="0 12px 12px 12px"
            borderRadius="8px"
            sx={{
              '& .rte-editor': {
                backgroundColor: corePalette.white,
              },
            }}
          >
            <RichTextEditor
              ref={changeOrRefinementNotesEditorRef}
              classNames={{
                editor: 'rte-editor',
              }}
              initialText={newMolecularConfirmation.changeOrRefinementNotes ?? undefined}
              title={(
                <CustomTypography variant="subtitle1" color={corePalette.grey100} fontWeight="medium">
                  Notes:
                </CustomTypography>
                )}
              mode={canEdit ? 'autoSave' : 'readOnly'}
              onSave={(newText): void => setNewMolecularConfirmation((prev) => ({
                ...prev,
                changeOrRefinementNotes: newText,
              }))}
            />
          </Grid>
        )}
      </Grid>
      {newMolecularConfirmation.changeOrRefinement !== 'No change required' && (
        <>
          <Grid
            container
            direction="column"
            spacing={1}
          >
            <CustomTypography
              variant="titleSmall"
              fontWeight="medium"
            >
              Is the Pathologist in agreement with the changed/refined diagnosis?
            </CustomTypography>
            <AutoWidthSelect
              options={pathologistAgreementOptions.map((o) => ({ name: o, value: o }))}
              value={newMolecularConfirmation.pathologistAgreement}
              onChange={(e): void => setNewMolecularConfirmation((prev) => ({
                ...prev,
                pathologistAgreement: e.target.value as PathologistAgreementOption,
              }))}
              overrideReadonlyMode={!canEdit}
              sx={{ width: '300px' }}
            />
            <Grid
              direction="column"
              container
              bgcolor={corePalette.grey10}
              padding="12px"
              borderRadius="8px"
              sx={{
                '& .rte-editor': {
                  backgroundColor: corePalette.white,
                },
              }}
            >
              <CustomTypography
                variant="subtitle1"
                color={corePalette.grey100}
                fontWeight="medium"
              >
                Communication method with pathologist:
              </CustomTypography>
              <TextField
                value={newMolecularConfirmation.pathologistCommunicationMethod ?? ''}
                onChange={(e): void => setNewMolecularConfirmation((prev) => ({
                  ...prev,
                  pathologistCommunicationMethod: e.target.value,
                }))}
                variant="outlined"
                disabled={!canEdit}
                sx={{ width: '300px' }}
              />
              <RichTextEditor
                ref={pathologistAgreementNotesEditorRef}
                classNames={{
                  editor: 'rte-editor',
                }}
                initialText={newMolecularConfirmation.pathologistAgreementNotes ?? undefined}
                title={(
                  <CustomTypography
                    variant="subtitle1"
                    color={corePalette.grey100}
                    fontWeight="medium"
                  >
                    Notes:
                  </CustomTypography>
                )}
                mode={canEdit ? 'autoSave' : 'readOnly'}
                onSave={(newText): void => setNewMolecularConfirmation((prev) => ({
                  ...prev,
                  pathologistAgreementNotes: newText,
                }))}
              />
            </Grid>
          </Grid>
          <Grid
            container
            direction="column"
            spacing={1}
          >
            <CustomTypography
              variant="titleSmall"
              fontWeight="medium"
            >
              Has the ZERO Final Diagnosis been updated following these molecular findings?
            </CustomTypography>
            <AutoWidthSelect
              options={['Yes', 'No'].map((o) => ({ name: o, value: o }))}
              value={boolToStr(
                newMolecularConfirmation.finalDiagnosisUpdated,
              )}
              onChange={(e): void => setNewMolecularConfirmation((prev) => ({
                ...prev,
                finalDiagnosisUpdated: strToBool(e.target.value as string) as boolean,
              }))}
              overrideReadonlyMode={!canEdit}
              sx={{ width: '300px' }}
            />
          </Grid>
        </>
      )}
      {hasUpdate && (
        <Grid
          container
          direction="row"
          gap="16px"
          marginBottom="-12px"
          justifyContent="flex-end"
        >
          <CustomButton
            label="Cancel"
            variant="subtle"
            size="small"
            onClick={(): void => {
              setNewMolecularConfirmation({ ...molecularConfirmation });
              changeOrRefinementNotesEditorRef?.current?.reset(
                molecularConfirmation.changeOrRefinementNotes
                ?? JSON.stringify(emptyEditorState),
              );
              pathologistAgreementNotesEditorRef?.current?.reset(
                molecularConfirmation.pathologistAgreementNotes
                ?? JSON.stringify(emptyEditorState),
              );
            }}
          />
          <CustomButton
            label="Save"
            variant="bold"
            size="small"
            onClick={handleSave}
          />
        </Grid>
      )}
    </Grid>
  );
}
