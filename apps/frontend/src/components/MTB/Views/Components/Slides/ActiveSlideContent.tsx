import {
    Box, Grid, IconButton, styled, TextField,
} from '@mui/material';
import { corePalette } from '@/themes/colours';
import CustomButton from '@/components/Common/Button';
import { useClinical } from '@/contexts/ClinicalContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { useMemo, useRef, useState, type JSX } from 'react';
import LoadingAnimation from '@/components/Animations/LoadingAnimation';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { boolToStr, strToBool } from '@/utils/functions/bools';
import { isResource } from '@/types/Evidence/Evidences.types';
import {
    EyeOffIcon, ImagePlusIcon, Maximize2Icon, Minimize2Icon,
} from 'lucide-react';
import useEvidences from '@/api/useEvidences';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { enqueueSnackbar } from 'notistack';
import CustomDialog from '@/components/Common/CustomDialog';
import EvidenceArchive from '@/components/Evidence/Archive/EvidenceArchive';
import { IMolecularAlterationDetail } from '@/types/MTB/MolecularAlteration.types';
import CustomTypography from '../../../../Common/Typography';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import MolecularAlteration from './MolecularAlteration';
import ImageGraph from '../Common/Image/ImageGraph';
import ImageCardSlideActions from '../Common/Image/ImageCardSlideActions';
import MolAlterationsSelectModal from './GenerateSlides/MolAlterationsSelectModal';

const EditorWrapper = styled('span')({
  width: '100%',
  '&:hover': {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& #hide-description-button': {
      visibility: 'visible',
      opacity: 1,
    },
  },
});

interface IProps {
  isPresentationMode: boolean;
}

export function ActiveSlideContent({
  isPresentationMode,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    attachments,
    updateSlideData,
    getSlideFiles,
    updateSlideAlterations,
  } = useActiveSlide();
  const {
    getEvidenceById,
    updateSlideNoteEvidence,
  } = useEvidences();

  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState<boolean>(false);
  const [alterationDialogOpen, setAlterationDialogOpen] = useState<boolean>(false);

  const [title, setTitle] = useState<string>(slide?.title ?? '');

  const rightAttachments = useMemo(
    () => attachments.filter((file) => file.sectionId === null && !file.isAtBottom),
    [attachments],
  );
  const bottomAttachments = useMemo(
    () => attachments.filter((file) => file.sectionId === null && file.isAtBottom),
    [attachments],
  );
  const noteWidth = useMemo(
    () => (attachments
      .filter((file) => file.sectionId === null && !file.isAtBottom)
      .length === 0 ? 12 : slide?.settings?.noteWidth ?? 8),
    [attachments, slide?.settings?.noteWidth],
  );

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const handleTitleSave = (): void => {
    if (slide) {
      zeroDashSdk.mtb.slides.updateSlide(clinicalVersion.id, slide.id, { title });
      updateSlideData('title', title);
    }
  };

  const canAddComments = useIsUserAuthorised('common.sample.suggestion.write');

  const initialText = useRef<string>(slide?.slideNote || '');

  if (!slide) {
    return (
      <LoadingAnimation
        baseColour={corePalette.white}
        dotColour={corePalette.white}
      />
    );
  }

  const onAddEvidence = async (
    evidenceId: string,
    triggerReload?: boolean,
  ): Promise<void> => {
    if (slide) {
      try {
        const evidence = await getEvidenceById(evidenceId);
        if (
          evidence
            && isResource(evidence)
            && evidence.fileId
            && evidence.type === 'IMG'
        ) {
          await zeroDashSdk.mtb.slides.addSlideAttachment(clinicalVersion.id, slide.id, {
            fileId: evidence.fileId,
            fileType: 'png',
            title: evidence.name,
            width: 4,
          });
          getSlideFiles(slide.id, triggerReload);
        }
      } catch (err) {
        enqueueSnackbar('Could not attach image to slide, please try again', { variant: 'error' });
      }
    }
  };

  const handleSave = (content: string): void => {
    if (slide) {
      zeroDashSdk.mtb.slides.updateSlide(clinicalVersion.id, slide.id, { slideNote: content });
      updateSlideData('slideNote', content || '');
      updateSlideNoteEvidence(content, slide.id, clinicalVersion.id);
    }
  };

  const handleHideDescription = async (): Promise<void> => {
    if (slide) {
      try {
        await zeroDashSdk.mtb.slides.updateSlideSetting(clinicalVersion.id, slide.id, {
          setting: 'showDescription',
          value: boolToStr(!strToBool(slide.settings?.showDescription)),
        });
        updateSlideData('settings', {
          ...slide.settings,
          showDescription: boolToStr(!strToBool(slide.settings?.showDescription)),
        });
      } catch (err) {
        enqueueSnackbar('Could not update slide settings, please try again', { variant: 'error' });
      }
    }
  };

  const handleNoteResize = async (operation: 'larger' | 'smaller'): Promise<void> => {
    if (slide) {
      try {
        const newWidth = operation === 'larger' ? noteWidth + 1 : noteWidth - 1;
        await zeroDashSdk.mtb.slides.updateSlideSetting(clinicalVersion.id, slide.id, {
          setting: 'noteWidth',
          value: newWidth.toString(),
        });
        updateSlideData('settings', {
          ...slide.settings,
          noteWidth: newWidth,
        });
      } catch {
        enqueueSnackbar('Could not update slide settings, please try again', { variant: 'error' });
      }
    }
  };

  const onEvidenceSubmit = async (
    evidenceId: string,
  ): Promise<void> => {
    if (slide) {
      try {
        const evidence = await zeroDashSdk.services.evidence.getResourceById(evidenceId);
        if (evidence && evidence.fileId) {
          await zeroDashSdk.mtb.slides.addSlideAttachment(clinicalVersion.id, slide?.id, {
            fileId: evidence.fileId,
            fileType: 'png',
            title: evidence.name,
            width: 4,
          });
          getSlideFiles(slide.id);
        }
      } catch {
        enqueueSnackbar('Could not attach image to slide, please try again', { variant: 'error' });
      }
    }
  };

  const handleEditSlideAlterations = async (
    newAlts?: IMolecularAlterationDetail[],
  ): Promise<void> => {
    try {
      updateSlideAlterations(newAlts);
      setAlterationDialogOpen(false);
    } catch (err) {
      enqueueSnackbar('Could not edit slide details, please try again,', { variant: 'error' });
    }
  };

  return (
    <>
      <Grid container spacing={2} direction="row" padding="16px 32px">
        <Grid container size={noteWidth}>
          <Grid container size={12} spacing={1} direction="column">
            <Grid>
              {!isPresentationMode && (
              <CustomTypography
                variant="label"
              >
                Slide Name
              </CustomTypography>
              )}
              {isPresentationMode ? (
                <CustomTypography
                  variant="titleRegular"
                  fontWeight="bold"
                >
                  {title}
                </CustomTypography>
              ) : (
                <TextField
                  key={`${slide?.id}-title`}
                  disabled={!canEditSlide}
                  variant="standard"
                  value={title}
                  fullWidth
                  slotProps={{
                    input: {
                      sx: {
                        fontSize: '24px',
                      },
                    },
                  }}
                  onChange={(e): void => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                />
              )}
            </Grid>
            {!isPresentationMode && slide?.alterations && (
              <Grid>
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  gap="8px"
                  marginBottom="8px"
                >
                  <CustomTypography
                    variant="label"
                    style={{ color: corePalette.offBlack100 }}
                  >
                    Molecular Alterations
                  </CustomTypography>
                  <CustomButton
                    label="Manage"
                    variant="text"
                    size="small"
                    disabled={!canEditSlide}
                    onClick={(): void => setAlterationDialogOpen(true)}
                  />
                </Box>
                <Box
                  display="flex"
                  flexDirection="row"
                  flexWrap="wrap"
                  gap="8px"
                >
                  {slide.alterations.map((a) => (
                    <MolecularAlteration
                      key={a.id}
                      alteration={a}
                    />
                  ))}
                </Box>
              </Grid>
            )}
            {(!isPresentationMode || strToBool(slide.settings?.showDescription || 'True')) && (
              <EditorWrapper>
                <RichTextEditor
                  mode={!canEditSlide || isPresentationMode ? 'readOnly' : 'autoSave'}
                  commentMode={canAddComments ? 'edit' : 'readOnly'}
                  hideComments={isPresentationMode}
                  flexibleTableWidth={isPresentationMode}
                  initialText={initialText.current}
                  title={!isPresentationMode ? (
                    <Box
                      display="flex"
                      flexDirection="row"
                      justifyContent="space-between"
                      width="100%"
                    >
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="center"
                        gap="8px"
                      >
                        <CustomTypography
                          variant="label"
                          style={{ color: '#022034' }}
                        >
                          Slide Note
                        </CustomTypography>
                        {canEditSlide && (
                          <IconButton
                            id="hide-description-button"
                            onClick={handleHideDescription}
                            sx={{
                              color: corePalette.grey200,
                              left: '8px',
                              opacity: strToBool(slide.settings?.showDescription) ? 0 : 1,
                              visibility: strToBool(slide.settings?.showDescription) ? 'hidden' : 'visible',
                              transition: 'all 0.5s cubic-bezier(.19,1,.22,1)',
                            }}
                          >
                            <EyeOffIcon />
                          </IconButton>
                        )}
                      </Box>
                      <Box
                        display="flex"
                        flexDirection="row"
                        alignItems="center"
                        justifyContent="flex-start"
                        gap="5px"
                      >
                        <IconButton
                          disabled={!canEditSlide || noteWidth === 4 || noteWidth === 12}
                          onClick={(): Promise<void> => handleNoteResize('smaller')}
                        >
                          <Minimize2Icon style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                        <IconButton
                          disabled={!canEditSlide || noteWidth === 8 || noteWidth === 12}
                          onClick={(): Promise<void> => handleNoteResize('larger')}
                        >
                          <Maximize2Icon style={{ transform: 'rotate(45deg)' }} />
                        </IconButton>
                        <IconButton
                          disabled={!canEditSlide}
                          onClick={(): void => setAttachmentDialogOpen(true)}
                        >
                          <ImagePlusIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : undefined}
                  onSave={handleSave}
                  onAddEvidence={onAddEvidence}
                  hideEvidence={isPresentationMode}
                  hideEmptyEditor={isPresentationMode}
                />
              </EditorWrapper>
            )}
          </Grid>
          {bottomAttachments.length > 0 && (
            <Grid
              container
              spacing={2}
              height="min-content"
            >
              {bottomAttachments.map((file) => (
                <Grid
                  key={file.fileId}
                  size={file.width}
                >
                  <ImageGraph
                    file={file}
                    Actions={ImageCardSlideActions}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
        {rightAttachments.length > 0 && (
          <Grid
            container
            size={12 - noteWidth}
            spacing={2}
            height="min-content"
          >
            {rightAttachments.map((file) => (
              <Grid
                key={file.fileId}
                size={file.width}
              >
                <ImageGraph
                  file={file}
                  Actions={ImageCardSlideActions}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
      {attachmentDialogOpen && (
        <CustomDialog
          open={attachmentDialogOpen}
          onClose={(): void => setAttachmentDialogOpen(false)}
          title="Add slide attachments"
          content={(
            <EvidenceArchive
              handlePickEvidence={(evidence): void => {
                onEvidenceSubmit(evidence.id);
              }}
              initialFilters={{
                resourceType: ['IMG'],
              }}
              canSelectEvidence={canEditSlide}
              isEvidenceSeleted={
                (e): boolean => isResource(e) && attachments.some((a) => a.fileId === e.fileId)
              }
            />
          )}
        />
      )}
      {alterationDialogOpen && (
        <MolAlterationsSelectModal
          open={alterationDialogOpen}
          onClose={(): void => setAlterationDialogOpen(false)}
          onSave={handleEditSlideAlterations}
          alterations={slide?.alterations}
        />
      )}
    </>
  );
}
