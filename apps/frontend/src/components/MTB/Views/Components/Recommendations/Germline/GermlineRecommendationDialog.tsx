import {
  Box,
  Checkbox,
  Dialog, FormControlLabel, FormGroup, IconButton,
  TextField,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { createEditor } from '@udecode/plate';
import {
  ArrowDownIcon, ArrowUpIcon, XIcon,
} from 'lucide-react';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import {
  Dispatch, SetStateAction, useCallback, useState, type JSX,
} from 'react';
import { v4 } from 'uuid';
import { trimRTEValue } from '@/utils/editor/trimRTEValue';
import { parseText } from '@/utils/editor/parser';
import { appendNewlineRTE } from '@/utils/editor/appendNewlineRTE';
import { corePalette } from '@/themes/colours';
import { ScrollableSection } from '@/components/ScrollableSection/ScrollableSection';
import useEvidences from '@/api/useEvidences';
import { germlineRecommendationOptions } from '../../../../../../constants/options';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import {
  GermlineRecOption,
  IFetchRecommendation,
  RecommendationLinkEntity,
} from '../../../../../../types/MTB/Recommendation.types';
import CustomButton from '../../../../../Common/Button';
import CustomTypography from '../../../../../Common/Typography';
import { RichTextEditor } from '../../../../../Input/RichTextEditor/RichTextEditor';

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
  editorWrapper: {
    width: '100%',
    minHeight: '210px',
  },
  autocomplete: {
    minHeight: '48px',
    paddingTop: '0px !important',
    paddingBottom: '0px !important',
  },
  autocompleteTag: {
    backgroundColor: corePalette.green10,
    color: corePalette.green150,
    border: `1px solid ${corePalette.green150}`,
    fontWeight: 500,
    fontSize: '14px',

    '& .MuiChip-deleteIcon': {
      color: corePalette.green150,
    },
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

export default function GermlineRecommendationDialog({
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
  const [description, setDescription] = useState<string>(existingRec ? appendNewlineRTE(existingRec.description) : '');
  const [germlineRecOptions, setGermlineRecOptions] = useState<GermlineRecOption[]>(
    existingRec?.germlineRecOptions ?? [],
  );

  const onCloseDialog = (): void => {
    setOpen(false);
    setTitle(existingRec?.title ?? '');
    setDescription(existingRec?.description ?? '');
    setGermlineRecOptions(existingRec?.germlineRecOptions ?? []);
  };

  const createGermlineRecommendation = async (): Promise<void> => {
    try {
      const newId = await zeroDashSdk.mtb.recommendation.addRecommendation(clinicalVersion.id, {
        type: 'GERMLINE',
        title,
        description: trimRTEValue(description),
        germlineRecOptions,
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
            germlineRecOptions,
          },
        );
        updateRecommendationEvidence(description, existingRec.id, clinicalVersion.id);
        onSubmitRecommendation({
          ...existingRec,
          title,
          description: newDescription,
          germlineRecOptions,
        });
        enqueueSnackbar('Recommendation updated successfully', { variant: 'success' });
        setOpen(false);
      } catch {
        enqueueSnackbar('Could not update recommendation, please try again', { variant: 'error' });
      }
    }
  };

  const updateDescriptionPrefilling = useCallback((options: GermlineRecOption[]) => {
    const editor = createEditor();
    const descValue = parseText(description);
    editor.children = descValue.value;
    editor.tf.removeNodes({
      at: [],
      match: { type: 'prefill' },
      mode: 'all',
    });
    if (options.length > 0) {
      editor.tf.insertNodes(
        {
          children: [{
            children: options.map((option) => ({
              children: [{
                type: 'lic',
                children: [{
                  text: germlineRecommendationOptions[option],
                }],
              }],
              type: 'li',
            })),
            type: 'ul',
          }],
          type: 'prefill',
        },
        { at: [0] },
      );
    }
    setDescription(JSON.stringify({ value: editor.children, comments: descValue.comments }));
  }, [description]);

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
          Germline recommendation
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
            alignItems="flex-start"
            width="100%"
            padding="24px"
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
            <FormGroup sx={{ width: '100%' }}>
              {germlineRecOptions.map((option, i) => (
                <motion.div
                  key={option}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                  layout
                  transition={{
                    ease: [0.19, 1, 0.22, 1],
                    duration: 0.4,
                  }}
                >
                  <FormControlLabel
                    label={germlineRecommendationOptions[option]}
                    sx={{ minHeight: '36px' }}
                    control={(
                      <Checkbox
                        checked
                        onChange={(): void => setGermlineRecOptions((prev) => {
                          const options = prev.filter((o) => o !== option);
                          updateDescriptionPrefilling(options);
                          return options;
                        })}
                      />
                    )}
                  />
                  <Box>
                    <IconButton
                      disabled={i === 0}
                      onClick={(): void => setGermlineRecOptions((prev) => {
                        const idx = prev.findIndex((o) => o === option);
                        const options = [...prev];
                        [options[idx], options[idx - 1]] = [options[idx - 1], options[idx]];
                        updateDescriptionPrefilling(options);
                        return options;
                      })}
                    >
                      <ArrowUpIcon />
                    </IconButton>
                    <IconButton
                      disabled={i === germlineRecOptions.length - 1}
                      onClick={(): void => setGermlineRecOptions((prev) => {
                        const idx = prev.findIndex((o) => o === option);
                        const options = [...prev];
                        [options[idx], options[idx + 1]] = [options[idx + 1], options[idx]];
                        updateDescriptionPrefilling(options);
                        return options;
                      })}
                    >
                      <ArrowDownIcon />
                    </IconButton>
                  </Box>
                </motion.div>
              ))}
              {Object.keys(germlineRecommendationOptions)
                .filter((option) => !germlineRecOptions?.includes(option as GermlineRecOption))
                .map((option) => (
                  <motion.div
                    key={option}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                    layout
                    transition={{
                      ease: [0.19, 1, 0.22, 1],
                      duration: 0.4,
                    }}
                  >
                    <FormControlLabel
                      label={germlineRecommendationOptions[option]}
                      sx={{ minHeight: '36px' }}
                      control={(
                        <Checkbox
                          checked={false}
                          onChange={(): void => setGermlineRecOptions((prev) => {
                            const options = [...prev, option as GermlineRecOption];
                            updateDescriptionPrefilling(options);
                            return options;
                          })}
                        />
                    )}
                    />
                  </motion.div>
                ))}
            </FormGroup>
            <span className={classes.editorWrapper}>
              <RichTextEditor
                key={JSON.stringify(germlineRecOptions)}
                initialText={description}
                title={(
                  <CustomTypography variant="label">
                    Description
                  </CustomTypography>
                  )}
                mode="autoSave"
                commentMode="readOnly"
                hideComments
                onSave={(newText): void => setDescription(newText)}
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
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={
                existingRec
                  ? updateRecommendation
                  : createGermlineRecommendation
              }
              disabled={germlineRecOptions.length === 0 || title.length === 0}
            />
          ) : (
            <CustomButton
              variant="bold"
              disabled={germlineRecOptions.length === 0 || title.length === 0}
              label={`${existingRec ? 'Edit' : 'Add'} Recommendation`}
              onClick={(): void => {
                onSubmitRecommendation({
                  // if existingRec is a temp rec, remove the temp/ prefix
                  id: `temp/${existingRec?.id.replace('temp/', '') ?? v4()}`,
                  type: 'GERMLINE',
                  clinicalVersionId: clinicalVersion?.id,
                  title,
                  description: trimRTEValue(description),
                  germlineRecOptions,
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
