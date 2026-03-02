import { Box, Grid } from '@mui/material';
import { useSnackbar } from 'notistack';
import {
  useCallback, useEffect, useState, type JSX,
} from 'react';
import useEvidences from '@/api/useEvidences';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IRTEContent, parseText } from '@/utils/editor/parser';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { ISlideAttachment } from '../../../../../types/MTB/MTB.types';
import { ISlide } from '../../../../../types/MTB/Slide.types';
import CustomDialog from '../../../../Common/CustomDialog';
import CustomTypography from '../../../../Common/Typography';
import { RichTextEditor } from '../../../../Input/RichTextEditor/RichTextEditor';
import { ScrollableSection } from '../../../../ScrollableSection/ScrollableSection';
import { CustomAddButton } from '../../../CommonButtons/CustomAddButton';
import ImageGraph from '../Common/Image/ImageGraph';
import MolecularAlteration from '../Slides/MolecularAlteration';
import { ArchiveAttachmentActions } from './ArchiveAttachmentActions';
import ArchivePerSlideSections from './ArchivePerSlideSections';
import ArchiveRecommendations from './ArchiveRecommendations';

interface IProps {
  open: boolean;
  onClose: () => void;
  slide: ISlide;
}

export default function ArchiveSlideModal({
  open,
  onClose,
  slide,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    setAddNewSlideCallback,
    isReportArchive,
  } = useMTBArchive();
  const {
    slide: activeSlide,
    updateSlideData,
  } = useActiveSlide();
  const {
    updateSlideNoteEvidence,
  } = useEvidences();

  // The slide that we are on in the current slide deck
  const [attachments, setAttachments] = useState<ISlideAttachment[]>([]);

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const appendToSlideNote = useCallback(async (
    slideToAddTo: ISlide,
    appendedContent: string,
  ): Promise<void> => {
    try {
      if (slideToAddTo.slideNote) {
        const parsedJSONOld = parseText(slideToAddTo.slideNote);
        const parsedJSONNew = parseText(appendedContent);

        // Append new state to old
        const slateStateFinal: IRTEContent = {
          value: parsedJSONOld.value.concat(parsedJSONNew.value),
          comments: {
            ...parsedJSONOld.comments,
            ...parsedJSONNew.comments,
          },
        };
        const newContent = JSON.stringify(slateStateFinal);
        await zeroDashSdk.mtb.slides.updateSlide(
          clinicalVersion.id,
          slideToAddTo.id,
          { slideNote: newContent },
        );
        updateSlideData('slideNote', newContent);
        updateSlideNoteEvidence(newContent, slideToAddTo.id, clinicalVersion.id);
        enqueueSnackbar('Appended to slide note', { variant: 'success' });
      }
    } catch {
      enqueueSnackbar('Could not append to slide note, please try again', { variant: 'error' });
    }
  }, [
    updateSlideNoteEvidence,
    clinicalVersion.id,
    enqueueSnackbar,
    updateSlideData,
    zeroDashSdk.mtb.slides,
  ]);

  useEffect(() => {
    async function getAttachments(): Promise<void> {
      if (slide?.id) {
        try {
          // Get relevant TPM/mutsig files
          const filesData = await zeroDashSdk.mtb.slides.getFilesBySlideId(
            clinicalVersion.id,
            slide.id,
          );

          if (filesData.length === 0) {
            setAttachments([]);
            return;
          }

          const urlMappedFiles = await Promise.all(filesData.map(async (graph) => ({
            ...graph,
            url: await zeroDashSdk.filetracker.downloadFile(graph.fileId)
              .then((blob) => URL.createObjectURL(blob)),
          })));
          setAttachments(urlMappedFiles);
        } catch (err) {
          setAttachments([]);
        }
      }
    }
    getAttachments();
  }, [slide?.id, zeroDashSdk.mtb.slides, zeroDashSdk.filetracker, clinicalVersion.id]);

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={slide.title || 'Untitled Slide'}
      content={(
        <ScrollableSection style={{ maxHeight: '100%', padding: '0px 16px' }}>
          <Box
            display="flex"
            flexDirection="column"
            gap="16px"
            padding="16px 0px"
          >
            {slide.alterations && (
              <Box display="flex" gap="16px" flexWrap="wrap">
                {slide.alterations.map((a) => (
                  <MolecularAlteration
                    key={a.id}
                    alteration={a}
                    isOnSlide={false}
                  />
                ))}
              </Box>
            )}
            <Box display="flex" gap="16px" width="100%">
              {/** Not sure why, but the RTE only took 100% width when the span is added  */}
              <span style={{ width: '100%' }}>
                <RichTextEditor
                  mode="readOnly"
                  commentMode="readOnly"
                  hideComments
                  initialText={slide?.slideNote}
                  title={(
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="flex-end"
                      width="100%"
                      marginBottom="16px"
                    >
                      <CustomTypography variant="label">
                        Slide Note
                      </CustomTypography>
                      {!isReportArchive && (
                        <Box display="flex" gap="16px">
                          {activeSlide && canEditSlide && (
                            <CustomAddButton
                              // cannot check if it is already added because of the text box
                              isAdded={false}
                              onAdd={(): Promise<void> => appendToSlideNote(activeSlide, slide.slideNote || '')}
                              buttonLabel="Add to current slide"
                            />
                          )}
                          {canEditSlide && (
                            <CustomAddButton
                              // cannot check if it is already added because of the text box
                              isAdded={false}
                              onAdd={(): void => (
                                setAddNewSlideCallback(() => (
                                  (s: ISlide) => appendToSlideNote(s, slide.slideNote || '')
                                ))
                              )}
                              buttonLabel="Add to a new slide"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  )}
                />
              </span>
            </Box>
            <Box display="flex" flexDirection="column" gap="8px">
              <CustomTypography variant="label">
                Attachments
              </CustomTypography>
              <Grid container wrap="wrap">
                {attachments.map((file) => (
                  <Grid
                    key={file.fileId}
                    size={3}
                    style={{
                      paddingRight: '8px',
                      paddingBottom: '8px',
                    }}
                  >
                    <ImageGraph
                      file={file}
                      Actions={isReportArchive ? undefined : ArchiveAttachmentActions}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <CustomTypography variant="label">
              Germline Sections
            </CustomTypography>
            <ArchivePerSlideSections slideId={slide.id} />
            <Box display="flex" flexDirection="column" gap="16px">
              <CustomTypography variant="label">
                Recommendation
              </CustomTypography>
              <ArchiveRecommendations filters={{ entityId: slide.id }} />
            </Box>
          </Box>
        </ScrollableSection>
      )}
    />
  );
}
