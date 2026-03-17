import { Dispatch, SetStateAction, useState, type JSX } from 'react';
import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import plateToMarkdown from '@/utils/editor/plateToMarkdown';
import { Box } from '@mui/material';
import { useSnackbar } from 'notistack';
import { IAnalysisPatient } from '@/types/Analysis/AnalysisSets.types';

interface IProps {
  patient: IAnalysisPatient;
  updatePatient?: (value: IAnalysisPatient) => void;
  isModalOpen: boolean;
  handleClose: () => void;
  latestComments: string;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}
export default function UpdateCommentsModal({
  patient,
  updatePatient,
  isModalOpen,
  handleClose,
  latestComments,
  isLoading,
  setIsLoading,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const [editedComments, setEditedComments] = useState<string>(latestComments);

  const handleOnConfirm = async (): Promise<void> => {
    if (!patient || !patient.patientId || !updatePatient) return;

    setIsLoading(true);
    try {
      await zeroDashSdk.patient.updatePatient(patient.patientId, { comments: editedComments });
      updatePatient({
        ...patient,
        comments: editedComments,
      });
      enqueueSnackbar('Patient comments were succesfully updated', { variant: 'success' });
      handleClose();
    } catch (e) {
      enqueueSnackbar('Failed to update patient\'s comments, please try again', { variant: 'error' });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomModal
      title={`Patient ID: ${patient.patientId} - Update comments`}
      open={isModalOpen}
      onClose={handleClose}
      buttonText={{ confirm: 'Update comments' }}
      confirmDisabled={editedComments === latestComments || isLoading}
      onConfirm={handleOnConfirm}
      content={(
        <Box display="flex" width="100%">
          <RichTextEditor
            classNames={{
              editor: 'comment-editor',
            }}
            mode="autoSave"
            disablePlugins={[
              'table',
              'evidence',
              'inline-citation',
              'underline',
              'text-bg',
              'text-colour',
              'comment',
            ]}
            title={(
              <CustomTypography variant="label">
                COMMENTS
              </CustomTypography>
            )}
            initialText={latestComments}
            onChange={(value): void => setEditedComments(plateToMarkdown(JSON.parse(value).value))}
          />
        </Box>
      )}
    />
  );
}
