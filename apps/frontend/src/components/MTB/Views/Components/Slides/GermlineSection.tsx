import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
    Box,
    Grid,
    IconButton,
    TextField,
} from '@mui/material';
import {
    ArrowDownIcon, ArrowUpIcon, ImagePlus, Maximize2, Minimize2, Trash2Icon,
} from 'lucide-react';
import { useCallback, useRef, useState, useMemo, type JSX } from 'react';
import * as motion from 'motion/react-client';
import { useSnackbar } from 'notistack';
import CustomDialog from '@/components/Common/CustomDialog';
import EvidenceArchive from '@/components/Evidence/Archive/EvidenceArchive';
import { isResource } from '@/types/Evidence/Evidences.types';
import CustomModal from '@/components/Common/CustomModal';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import {
    ISlideSection,
    ISlideSectionUpdate,
} from '../../../../../types/MTB/Slide.types';
import CustomTypography from '../../../../Common/Typography';
import ImageGraph from '../Common/Image/ImageGraph';
import ImageCardSlideActions from '../Common/Image/ImageCardSlideActions';

export interface IGermlineSectionProps {
  section: ISlideSection;
  isPresentationMode: boolean;
}

export function GermlineSection({
  section,
  isPresentationMode,
}: IGermlineSectionProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    getSlideFiles,
    setGermlineSections,
    attachments,
    setAttachments,
  } = useActiveSlide();

  const [name, setName] = useState<string | undefined>(section?.name);
  const [open, setOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  const rightAttachments = useMemo(
    () => attachments
      .filter((file) => file.sectionId === section.id && !file.isAtBottom),
    [attachments, section.id],
  );
  const bottomAttachments = useMemo(
    () => attachments
      .filter((file) => file.sectionId === section.id && file.isAtBottom),
    [attachments, section.id],
  );
  const contentWidth = useMemo(() => (attachments
    .filter((file) => file.sectionId === section.id && !file.isAtBottom)
    .length === 0 ? 12 : section.width
  ), [attachments, section.width, section.id]);

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canEditGermlineSection = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;
  const canAddComments = useIsUserAuthorised('common.sample.suggestion.write');

  const initialText = useRef<string>(section.description || '');

  const updateSlideSection = useCallback(async (
    sectionId: string,
    data: ISlideSectionUpdate,
  ): Promise<void> => {
    await zeroDashSdk.mtb.slides.updateSlideSection(clinicalVersion.id, sectionId, data);
  }, [clinicalVersion.id, zeroDashSdk.mtb.slides]);

  const updateSectionOrder = async (
    data: Pick<ISlideSection, 'id' | 'order'>[],
  ): Promise<void> => {
    await zeroDashSdk.mtb.slides.updateSectionOrder(clinicalVersion.id, data);
  };

  const handleNameSave = (): void => {
    updateSlideSection(section?.id, {
      name,
      description: section?.description,
    });
  };

  const handleDescriptionSave = useCallback((content: string): void => {
    updateSlideSection(section?.id, {
      name: section?.name,
      description: content,
    });
  }, [section?.id, section?.name, updateSlideSection]);

  const onSectionMove = (direction: 'up' | 'down'): void => {
    setGermlineSections((prev) => {
      const newSections = [...prev];
      const index = prev.findIndex((s) => s.id === section.id);
      if (direction === 'up' && index > 0) {
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      }
      if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index + 1], newSections[index]] = [newSections[index], newSections[index + 1]];
      }
      updateSectionOrder([
        ...newSections.map((s, i) => ({
          id: s.id,
          order: i + 1,
        })),
      ]);
      return newSections.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const onSectionResize = (operation: 'larger' | 'smaller'): void => {
    const newWidth = operation === 'larger' ? section.width + 1 : section.width - 1;
    updateSlideSection(
      section.id,
      { width: newWidth },
    );
    setGermlineSections((prev) => prev.map((s) => (s.id === section.id
      ? { ...s, width: newWidth }
      : s)));
  };

  const deleteSlideSection = async (id: string): Promise<void> => {
    if (slide) {
      try {
        const fileIds = [
          ...rightAttachments.map((a) => a.fileId),
          ...bottomAttachments.map((a) => a.fileId),
        ];
        await zeroDashSdk.mtb.slides.deleteSlideSection(clinicalVersion.id, id);
        await Promise.all(
          fileIds.map((fileId) => zeroDashSdk.mtb.slides.deleteFileBySlideId(
            clinicalVersion.id,
              slide.id as string,
              fileId,
          )),
        );
        setGermlineSections((prev) => {
          const newSections = prev
            .filter((s) => s.id !== id)
            .map((s, i) => ({ ...s, order: i + 1 }));
          updateSectionOrder([
            ...newSections.map((s) => ({
              id: s.id,
              order: s.order,
            })),
          ]);
          return newSections;
        });
        setAttachments((prev) => prev.filter((a) => !fileIds.includes(a.fileId)));
      } catch {
        enqueueSnackbar('Could not delete germline section, please try again', { variant: 'error' });
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
            sectionId: section.id,
          });
          getSlideFiles(slide.id);
        }
      } catch {
        enqueueSnackbar('Could not attach image to slide, please try again', { variant: 'error' });
      }
    }
  };

  return (
    <motion.div
      layout
      transition={{
        ease: [0.19, 1, 0.22, 1],
        duration: 0.4,
      }}
    >
      <Grid spacing={2} container direction="row">
        <Grid container size={contentWidth}>
          <Grid container size={12} spacing={1} direction="column">
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="flex-start"
                width="100%"
              >
                {!isPresentationMode && (
                  <CustomTypography variant="label" style={{ color: '#022034' }}>
                    Section Name
                  </CustomTypography>
                )}
                {isPresentationMode ? (
                  <CustomTypography variant="titleRegular" fontWeight="medium">
                    {name}
                  </CustomTypography>
                ) : (
                  <TextField
                    disabled={!canEditGermlineSection || section.type !== 'Custom'}
                    variant="standard"
                    value={name}
                    onChange={(e): void => setName(e.target.value)}
                    onBlur={handleNameSave}
                  />
                )}
              </Box>
              {!isPresentationMode && (
                <Box
                  display="flex"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap="5px"
                >
                  <IconButton
                    disabled={!canEditGermlineSection || contentWidth === 4 || contentWidth === 12}
                    onClick={(): void => onSectionResize('smaller')}
                  >
                    <Minimize2 style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                  <IconButton
                    disabled={!canEditGermlineSection || contentWidth === 8 || contentWidth === 12}
                    onClick={(): void => onSectionResize('larger')}
                  >
                    <Maximize2 style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                  <IconButton
                    disabled={!canEditGermlineSection}
                    onClick={(): void => onSectionMove('down')}
                  >
                    <ArrowDownIcon />
                  </IconButton>
                  <IconButton
                    disabled={!canEditGermlineSection}
                    onClick={(): void => onSectionMove('up')}
                  >
                    <ArrowUpIcon />
                  </IconButton>
                  <IconButton
                    disabled={!canEditGermlineSection}
                    onClick={(): void => setOpen(true)}
                  >
                    <ImagePlus />
                  </IconButton>
                  <IconButton
                    disabled={!canEditGermlineSection}
                    onClick={(): void => setDeleteModalOpen(true)}
                  >
                    <Trash2Icon />
                  </IconButton>
                </Box>
              )}
            </Box>
            <RichTextEditor
              mode={!canEditGermlineSection || isPresentationMode ? 'readOnly' : 'autoSave'}
              commentMode={canAddComments ? 'edit' : 'readOnly'}
              hideComments={isPresentationMode}
              flexibleTableWidth={isPresentationMode}
              initialText={initialText.current}
              title={!isPresentationMode && (
              <CustomTypography variant="label" style={{ color: '#022034' }}>
                Description
              </CustomTypography>
              )}
              condensed={isPresentationMode}
              onSave={handleDescriptionSave}
              hideEvidence={isPresentationMode}
              hideEmptyEditor={isPresentationMode}
            />
          </Grid>
          {bottomAttachments.length > 0 && (
            <Grid
              container
              height="min-content"
              spacing={2}
              size={12}
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
            size={12 - contentWidth}
            height="min-content"
            spacing={2}
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
      {open && (
        <CustomDialog
          open={open}
          onClose={(): void => setOpen(false)}
          title="Add germline section attachments"
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
      {deleteModalOpen && (
        <CustomModal
          title="Delete section"
          content={'Are you sure you want to remove this section?\nThis action cannot be undone.'}
          open={deleteModalOpen}
          onClose={(): void => setDeleteModalOpen(false)}
          variant="alert"
          buttonText={{
            cancel: 'No, don\'t delete',
            confirm: 'Yes, delete',
          }}
          onConfirm={(): Promise<void> => deleteSlideSection(section?.id)}
        />
      )}
    </motion.div>
  );
}
