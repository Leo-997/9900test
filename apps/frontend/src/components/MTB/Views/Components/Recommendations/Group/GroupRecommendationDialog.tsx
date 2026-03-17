import {
  Box,
  Dialog as MuiDialog,
  styled, TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { Dispatch, ReactNode, SetStateAction, useMemo, useState, type JSX } from 'react';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useGroupRecommendation } from '../../../../../../contexts/GroupRecommendationContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { IFetchRecommendation } from '../../../../../../types/MTB/Recommendation.types';
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
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  order?: number;
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
}

export default function GroupRecommendationDialog({
  open,
  setOpen,
  order,
  onSubmitRecommendation,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const {
    entity,
    title,
    setTitle,
    existingRec,
    selectedSlideRecs,
    newReportRecs,
    reportRecs,
    resetDetails,
    addRecommendation,
    updateRecommendation,
    setNewReportRecs,
  } = useGroupRecommendation();

  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const submitDisabled = useMemo(
    () => title.length === 0
      || selectedSlideRecs.length
          + reportRecs.length
          + newReportRecs.length === 0,
    [
      reportRecs.length,
      newReportRecs.length,
      selectedSlideRecs.length,
      title.length,
    ],
  );

  const onClose = (): void => {
    resetDetails();
    setOpen(false);
    setNewReportRecs([]);
  };

  const handleAddRecommendation = async (): Promise<string | null> => {
    try {
      const newId = await addRecommendation([
        {
          order,
          ...entity,
        },
      ]);
      if (newId) {
        const newRec = await zeroDashSdk.mtb.recommendation.getRecommendationById(
          clinicalVersion.id,
          newId,
        );
        onSubmitRecommendation(newRec);
        onClose();
        enqueueSnackbar('Recommendation added successfully', { variant: 'success' });
        return newId;
      }

      return null;
    } catch {
      enqueueSnackbar('Could not add recommendation, please try again', { variant: 'error' });
      return null;
    }
  };

  const handleUpdateRecommendation = async (): Promise<void> => {
    if (existingRec && updateRecommendation) {
      try {
        const newId = await updateRecommendation();
        if (newId) {
          const newRec = await zeroDashSdk.mtb.recommendation.getRecommendationById(
            clinicalVersion.id,
            newId,
          );
          onSubmitRecommendation(newRec);
          onClose();
          enqueueSnackbar('Updated recommendation successfully', { variant: 'success' });
        }
      } catch (err) {
        enqueueSnackbar('Could not update recommendation, please try again', { variant: 'error' });
      }
    }
  };

  const getTooltipText = (): NonNullable<ReactNode> => {
    const text: string[] = [];
    if (title.length === 0) text.push('A recommendation title');
    if (selectedSlideRecs.length + reportRecs.length + newReportRecs.length === 0) {
      text.push('At least one selected recommendation');
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

  const handleSubmit = async (): Promise<void> => {
    const onSubmit = existingRec ? handleUpdateRecommendation : handleAddRecommendation;
    setSubmitLoading(true);
    await onSubmit();
    setSubmitLoading(false);
  };

  return (
    <Dialog
      key={`dialog-${open}`}
      open={open}
      onClose={onClose}
      disableEscapeKeyDown
    >
      <NavBar
        status={clinicalVersion.status}
        returnFn={onClose}
      />
      <Header
        title={(
          <TextField
            variant="standard"
            sx={{ width: '100%' }}
            placeholder="Group Recommendation Title"
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
      />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        width="100%"
        // 240px is the height sum of NavBar, Header, and Footer
        height="calc(100vh - 240px)"
      >
        <RecommendationLeftPanel />
        <RecommendationRightPanel />
      </Box>
      <Footer
        confirmLabel={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
        cancelLabel={`Discard${existingRec ? ' changes' : ''}`}
        confirmDisabled={submitDisabled || submitLoading}
        confirmLoading={submitLoading}
        tooltipText={getTooltipText()}
        handleConfirm={handleSubmit}
        handleCancel={onClose}
      />
    </Dialog>
  );
}
