import { useAnalysisSet } from '@/contexts/AnalysisSetContext';
import { useCuration } from '@/contexts/CurationContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
  Box,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useRef, useState, type JSX } from 'react';
import { failedStatusReasons } from '../../constants/options';
import { useZeroDashSdk } from '../../contexts/ZeroDashSdkContext';
import { FailedStatusReason } from '../../types/Samples/Sample.types';
import CustomModal from '../Common/CustomModal';
import CustomTypography from '../Common/Typography';
import { IRTERef, RichTextEditor } from '../Input/RichTextEditor/RichTextEditor';
import Select from '../Input/Select';

const useStyles = makeStyles(() => ({
  paper: {
    width: '800px',
    borderRadius: '16px',
    position: 'relative',
    overflow: 'visible',
  },
  closeButton: {
    position: 'absolute',
    right: '-20px',
    top: '-20px',
  },
  title: {
    backgroundColor: '#F3F5F7',
    borderRadius: '16px 16px 0 0',
  },
  content: {
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  actions: {
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid #ECF0F3',
  },
  commentEditor: {
    maxHeight: '100px',
  },
}));

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function FlagFailedSampleDialog({
  open,
  setOpen,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { analysisSet } = useAnalysisSet();
  const { updateCurationStatus } = useCuration();
  const { enqueueSnackbar } = useSnackbar();

  const [comment, setComment] = useState<string>('');
  const [selectedReason, setSelectedReason] = useState<FailedStatusReason | ''>('');
  const [loading, setLoading] = useState<boolean>(false);

  const editorRef = useRef<IRTERef | null>(null);

  const canEdit = useIsUserAuthorised('curation.sample.write');

  const handleSubmit = async (): Promise<void> => {
    setLoading(true);
    try {
      if (selectedReason && comment) {
        await updateCurationStatus(
          'Failed',
          selectedReason,
        );
        await zeroDashSdk.curationComments.createComment(
          {
            comment,
            type: 'ANALYSIS',
            threadType: 'ANALYSIS',
            entityId: analysisSet.analysisSetId,
            entityType: 'ANALYSIS',
            analysisSetId: analysisSet.analysisSetId,
          },
        );
      }
      enqueueSnackbar('Sample successfully marked as failed', { variant: 'success' });
      setOpen(false);
    } catch {
      enqueueSnackbar('Could not mark sample as failed, please try again', { variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <CustomModal
      title="Flag sample as failed"
      open={open}
      onClose={(): void => setOpen((prev) => !prev)}
      variant="alert"
      buttonText={{ confirm: 'Submit' }}
      confirmDisabled={!(comment && selectedReason) || loading}
      onConfirm={handleSubmit}
      content={(
        <>
          <Box width="50%">
            <Select
              options={failedStatusReasons}
              headerTitle="Reason"
              onChange={(e): void => setSelectedReason(e.target.value as FailedStatusReason)}
            />
          </Box>
          <Box>
            <RichTextEditor
              ref={editorRef}
              title={(
                <CustomTypography variant="label">COMMENT *</CustomTypography>
              )}
              mode={!canEdit ? 'readOnly' : 'autoSave'}
              disablePlugins={['table', 'evidence', 'inline-citation', 'text-colour', 'text-bg']}
              onChange={(value): void => setComment(editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value))}
              classNames={{
                editor: classes.commentEditor,
              }}
            />
          </Box>
          <CustomTypography variant="bodySmall">
            <i>
              Submitting this form will end the curation and mark this case as failed.
              You will no longer be able to make any changes to the case.
            </i>
          </CustomTypography>
        </>
        )}
    />
  );
}
