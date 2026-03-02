import {
  Box, Dialog, IconButton, TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { XIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  Dispatch, SetStateAction, useRef, useState, type JSX,
} from 'react';
import { v4 } from 'uuid';
import useEvidences from '@/api/useEvidences';
import CustomButton from '@/components/Common/Button';
import CustomTypography from '@/components/Common/Typography';
import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import { useClinical } from '@/contexts/ClinicalContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IFetchRecommendation, RecommendationLinkEntity } from '@/types/MTB/Recommendation.types';

const useStyles = makeStyles(() => ({
  dialogRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    position: 'absolute',
    minWidth: '832px',
    width: '832px',
    background: '#FFFFFF',
    boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
    borderRadius: '8px',
    overflowY: 'visible',
  },
  dialogHeader: {
    padding: '24px',
    gap: '8px',
    width: '832px',
    height: '76px',
    background: '#F3F5F7',
    borderRadius: '8px 8px 0px 0px',
  },
  header: {
    color: '#022034',
  },
  dialogContent: {
    width: '832px',
    border: '1px solid #ECF0F3',
  },
  action: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '16px 24px',
    gap: '208px',
    minWidth: '832px',
    width: '832px',
    background: '#FFFFFF',
    borderRadius: '0px 0px 8px 8px',
  },
  btnBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px',
    gap: '16px',
    width: '500px',
    height: '48px',
  },
}));

interface IProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  existingRec?: IFetchRecommendation;
  entity?: RecommendationLinkEntity;
  order?: number;
  onSubmitRecommendation: (newRec: IFetchRecommendation) => void;
}

export default function TextRecommendationDialog({
  open,
  setOpen,
  existingRec,
  entity,
  order,
  onSubmitRecommendation,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { clinicalVersion } = useClinical();
  const { enqueueSnackbar } = useSnackbar();
  const { updateRecommendationEvidence } = useEvidences();

  const [title, setTitle] = useState<string>(existingRec?.title ?? '');
  const [description, setDescription] = useState<string>(existingRec?.description ?? '');
  const [isEmpty, setIsEmpty] = useState<boolean>(!existingRec);

  const editorRef = useRef<IRTERef | null>(null);
  const initialText = useRef<string>(description);

  const onCloseDialog = (): void => {
    setOpen(false);
    setTitle(existingRec?.title ?? '');
    setDescription(existingRec?.description ?? '');
  };

  const createTextRecommendation = async (): Promise<void> => {
    if (clinicalVersion.id) {
      try {
        const newId = await zeroDashSdk.mtb.recommendation.addRecommendation(clinicalVersion.id, {
          type: 'TEXT',
          title,
          description,
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
      } catch (err) {
        enqueueSnackbar('Could not create recommendation, please try again', { variant: 'error' });
      } finally {
        onCloseDialog();
      }
    }
  };

  const updateRecommendation = async (): Promise<void> => {
    if (existingRec) {
      try {
        await zeroDashSdk.mtb.recommendation.updateRecommendation(
          clinicalVersion.id,
          existingRec?.id,
          {
            title,
            description,
          },
        );
        updateRecommendationEvidence(description, existingRec.id, clinicalVersion.id);
        onSubmitRecommendation({
          ...existingRec,
          title,
          description,
        });
        enqueueSnackbar('Recommendation updated successfully', { variant: 'success' });
        setOpen(false);
      } catch {
        enqueueSnackbar('Could not update recommendation, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <Dialog open={open} PaperProps={{ className: classes.dialogRoot }}>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        className={classes.dialogHeader}
      >
        <CustomTypography className={classes.header} variant="h5">
          Text recommendation
        </CustomTypography>
        <IconButton onClick={onCloseDialog}>
          <XIcon />
        </IconButton>
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        className={classes.dialogContent}
      >
        <ScrollableSection
          style={{
            maxHeight: 'calc(100vh - 250px)',
            width: '100%',
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            padding="16px 24px"
            gap="16px"
          >
            <TextField
              variant="standard"
              sx={{
                width: '100%',
              }}
              placeholder="Title"
              slotProps={{
                input: {
                  sx: {
                    fontSize: '20px',
                    fontWeight: 'medium',
                  },
                },
              }}
              value={title}
              onChange={(e): void => setTitle(e.target.value)}
            />
            <span>
              <RichTextEditor
                ref={editorRef}
                initialText={initialText.current}
                title={(
                  <CustomTypography variant="label">
                    Description
                  </CustomTypography>
                )}
                mode="autoSave"
                commentMode="readOnly"
                hideComments
                onSave={(val): void => setDescription(val)}
                onChange={(): void => {
                  if (editorRef.current) {
                    setIsEmpty(editorRef.current.isEmpty());
                  }
                }}
              />
            </span>
          </Box>

        </ScrollableSection>
      </Box>
      <Box className={classes.action}>
        <Box className={classes.btnBox}>
          <CustomButton
            variant="subtle"
            label={`Discard${existingRec ? ' changes' : ''}`}
            onClick={onCloseDialog}
          />
          {entity ? (
            <CustomButton
              variant="bold"
              disabled={isEmpty || title.length === 0}
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={
                existingRec
                  ? updateRecommendation
                  : createTextRecommendation
            }
            />
          ) : (
            <CustomButton
              variant="bold"
              disabled={isEmpty || title.length === 0}
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={(): void => {
                // if existingRec is a temp rec, remove the temp/ prefix
                onSubmitRecommendation({
                  id: `temp/${existingRec?.id.replace('temp/', '') ?? v4()}`,
                  clinicalVersionId: clinicalVersion.id,
                  type: 'TEXT',
                  title,
                  description,
                });
                onCloseDialog();
              }}
            />
          )}
        </Box>
      </Box>
    </Dialog>
  );
}
