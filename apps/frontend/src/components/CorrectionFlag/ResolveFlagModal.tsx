import { useRef, useState, type JSX } from 'react';

import { Box } from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import ReactMarkdown from 'react-markdown';
import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { ISampleCorrectionFlag } from '@/types/Corrections.types';
import { parseText } from '@/utils/editor/parser';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { correctionReasonOptions } from '../../constants/corrections';
import { useCuration } from '../../contexts/CurationContext';
import { useUser } from '../../contexts/UserContext';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import CustomButton from '../Common/Button';
import CustomModal from '../Common/CustomModal';
import CustomTypography from '../Common/Typography';
import { IRTERef, RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';
import { AutoWidthSelect } from '../Input/Select/AutoWidthSelect';

interface IProps {
  correction: ISampleCorrectionFlag;
  open: boolean;
  onClose: () => void;
}

const useStyles = makeStyles(() => createStyles({
  dialogRoot: {
    maxWidth: 1170,
    width: '60vw',
    height: '80vh',
    borderRadius: 8,
    overflowY: 'unset',
    zIndex: 10,
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    height: 64,
    paddingLeft: 48,
    backgroundColor: '#F3F5F7',
  },
  dialogContent: {
    height: 'calc(100% - 150px)',
    paddingLeft: 48,
    paddingTop: 40,
    paddingRight: 40,
  },
  closeButton: {
    position: 'absolute',
    top: -11,
    right: -11,
    padding: 0,
  },
  closeIcon: {
    width: '40px',
    height: '40px',
  },
  hairline: {
    border: 'none',
    borderTop: '1px dashed #D0D9E2',
    width: '100%',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  btn: {
    minWidth: '210px',
    marginRight: 16,
  },
  btnBox: {
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  markdown: {
    '& p': {
      fontSize: '16px',
      margin: 0,
    },
  },
  editor: {
    maxHeight: '300px',
  },
}));

function ResolveFlagModal({
  correction,
  open,
  onClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();
  const { currentUser, users } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { setCorrectionFlags } = useCuration();

  const [updatedFlagInfo, setUpdatedFlagInfo] = useState({
    correctionNote: correction.correctionNote || '',
    assignedResolver: correction.assignedResolverId ? correction.assignedResolverId : undefined,
  });

  const editorRef = useRef<IRTERef | null>(null);

  const isAssignedResolver = correction.assignedResolverId === currentUser?.id;

  const handleUpdateFlag = async (isCorrected = false): Promise<void> => {
    if (analysisSet.analysisSetId) {
      try {
        const markdownNote = plateToMarkdown(parseText(updatedFlagInfo.correctionNote).value);
        await zeroDashSdk.curation.flags.updateCorrectionFlag(
          analysisSet.analysisSetId,
          correction.flagId,
          {
            isCorrected,
            correctionNote: markdownNote,
            assignedResolver: updatedFlagInfo.assignedResolver,
          },
        );
        setCorrectionFlags((prev) => (
          prev.map((flag) => (
            flag.flagId === correction.flagId
              ? {
                ...flag,
                isCorrected,
                correctedBy: isCorrected ? currentUser : undefined,
                correctionNote: markdownNote,
                assignedResolver: users.find(
                  (user) => user.id === updatedFlagInfo.assignedResolver,
                )?.id || flag.assignedResolverId,
              }
              : flag
          ))
        ));
        onClose();
      } catch {
        enqueueSnackbar('Could not update the flag, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Resolve flag for correction"
      content={(
        <Box
          display="flex"
          flexDirection="column"
          padding="24px"
          gap="24px"
        >
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" flexDirection="column" gap="8px">
              <CustomTypography variant="label">
                Reason for flagging
              </CustomTypography>
              <CustomTypography>
                {correctionReasonOptions.find((o) => o.value === correction.reason)?.name}
              </CustomTypography>
            </Box>
            <Box display="flex" flexDirection="column" gap="8px">
              <CustomTypography variant="label">
                Re-assign resolver
              </CustomTypography>
              <AutoWidthSelect
                sx={{ width: 250, height: 60 }}
                options={users.map((user) => (
                  { name: `${user.givenName} ${user.familyName}`, value: user.id }
                ))}
                defaultValue={correction.assignedResolverId}
                onChange={(e): void => setUpdatedFlagInfo((prev) => ({
                  ...prev,
                  assignedResolver: e.target.value as string,
                }))}
              />
            </Box>
          </Box>
          <Box display="flex" flexDirection="column" gap="8px">
            <CustomTypography variant="label">
              Flag note
            </CustomTypography>
            <Box
              component="span"
              sx={{
                '& p': {
                  fontSize: '16px',
                  margin: 0,
                },
              }}
            >
              <ReactMarkdown>
                {correction.reasonNote || ''}
              </ReactMarkdown>
            </Box>
          </Box>
          <RichTextEditor
            ref={editorRef}
            initialText={correction.correctionNote}
            title={(
              <CustomTypography variant="label">
                Correction note
              </CustomTypography>
              )}
            mode={!isAssignedResolver ? 'readOnly' : 'autoSave'}
            disablePlugins={['table', 'evidence', 'inline-citation', 'text-colour', 'text-bg']}
            onChange={(value): void => setUpdatedFlagInfo(
              (prev) => ({
                ...prev,
                correctionNote: editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value),
              }),
            )}
            classNames={classes}
          />
        </Box>
      )}
      overrideActions={(
        <>
          <CustomButton
            variant="subtle"
            label="Cancel"
            onClick={onClose}
          />
          <CustomButton
            variant="outline"
            label="Update"
            onClick={() => {
              handleUpdateFlag();
            }}
            disabled={!isAssignedResolver}
          />
          <CustomButton
            variant="bold"
            label="Resolve"
            onClick={() => {
              handleUpdateFlag(true);
            }}
            disabled={!isAssignedResolver || !updatedFlagInfo.correctionNote}
          />
        </>
      )}
    />
  );
}

export default ResolveFlagModal;
