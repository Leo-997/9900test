import { correctionReasonOptions } from '@/constants/corrections';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ISelectOption } from '@/types/misc.types';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { Box, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useRef, useState, type JSX } from 'react';
import { useCuration } from '../../contexts/CurationContext';
import { useUser } from '../../contexts/UserContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { CorrectionReason, NewCorrectionFlagInput } from '../../types/Corrections.types';
import CustomAutocomplete from '../Common/Autocomplete';
import CustomModal from '../Common/CustomModal';
import LabelledInputWrapper from '../Common/LabelledInputWrapper';
import CustomTypography from '../Common/Typography';
import { IRTERef, RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

const useStyles = makeStyles(() => ({
  editor: {
    maxHeight: '300px',
  },
}));

interface IProps {
  open: boolean;
  onClose: () => void;
}

function CorrectionFlagModal({
  open,
  onClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { analysisSet } = useAnalysisSet();
  const { setCorrectionFlags } = useCuration();
  const { currentUser, users } = useUser();

  const editorRef = useRef<IRTERef | null>(null);

  const [
    newFlag,
    setNewFlag,
  ] = useState<NewCorrectionFlagInput>({
    reason: undefined,
    reasonNote: '',
    assignedResolverId: undefined,
  });

  const handleCreateNewFlags = async (): Promise<void> => {
    try {
      if (analysisSet.analysisSetId && currentUser?.id && Object.values(newFlag).every((v) => v)) {
        const markdown = plateToMarkdown(parseText(newFlag.reasonNote).value);
        await zeroDashSdk.curation.flags.createNewCorrectionFlag(
          {
            ...newFlag,
            reasonNote: markdown,
          },
          analysisSet.analysisSetId,
        )
          .then((resp) => {
            setCorrectionFlags((prev) => [
              ...prev,
              {
                flagId: resp.id,
                isCorrected: false,
                flaggedAt: dayjs().toString(),
                flaggedById: currentUser.id,
                reason: newFlag.reason || 'WRONG_INFO',
                reasonNote: markdown,
                assignedResolverId: newFlag.assignedResolverId || '',
              },
            ]);
          });
        onClose();
      }
    } catch (error) {
      enqueueSnackbar('Could not create a flag for correction, please try again', { variant: 'error' });
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      variant="create"
      buttonText={{
        confirm: 'Submit',
      }}
      confirmDisabled={Object.values(newFlag).some((v) => !v)}
      onConfirm={handleCreateNewFlags}
      title="Flag for correction"
      content={(
        <Box
          display="flex"
          flexDirection="column"
          padding="24px"
          gap="24px"
        >
          <Grid container justifyContent="space-between">
            <Grid size={4}>
              <LabelledInputWrapper label="Reason for flagging *">
                <AutoWidthSelect
                  sx={{ width: 250 }}
                  options={correctionReasonOptions}
                  onChange={(e): void => setNewFlag((prev) => ({
                    ...prev,
                    reason: e.target.value as CorrectionReason,
                  }))}
                />
              </LabelledInputWrapper>
            </Grid>
            <Grid size={4}>
              <CustomAutocomplete<ISelectOption<string>, false, false>
                label="Assigned resolver *"
                options={users.map((user) => (
                  { name: `${user.givenName} ${user.familyName}`, value: user.id }
                ))}
                getOptionLabel={(option): string => option.name}
                onChange={(e, v): void => setNewFlag((prev) => ({
                  ...prev,
                  assignedResolverId: v?.value,
                }))}
              />
            </Grid>
          </Grid>
          <RichTextEditor
            ref={editorRef}
            title={(
              <CustomTypography variant="label">
                Additional notes *
              </CustomTypography>
              )}
            mode="autoSave"
            disablePlugins={['table', 'evidence', 'inline-citation', 'text-colour', 'text-bg']}
            onChange={(value): void => setNewFlag(
              (prev) => ({
                ...prev,
                reasonNote: editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value),
              }),
            )}
            classNames={classes}
          />
        </Box>
      )}
    />
  );
}

export default CorrectionFlagModal;
