import {
  Box, IconButton as MuiIconButton, styled, Tooltip,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, type JSX } from 'react';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import { CheckIcon, CopyPlusIcon, PlusIcon } from 'lucide-react';
import { ISlideAttachment } from '../../../../../types/MTB/MTB.types';
import { useActiveSlide } from '../../../../../contexts/ActiveSlideContext';
import { useZeroDashSdk } from '../../../../../contexts/ZeroDashSdkContext';
import { useMTBArchive } from '../../../../../contexts/MTBArchiveContext';
import { ISlide } from '../../../../../types/MTB/Slide.types';
import { useClinical } from '../../../../../contexts/ClinicalContext';

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  padding: '5px',
}));

interface IProps {
  file: ISlideAttachment;
}

export function ArchiveAttachmentActions({
  file,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    setAddNewSlideCallback,
  } = useMTBArchive();
  const {
    clinicalVersion,
    isReadOnly,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide: activeSlide,
    attachments,
    getSlideFiles,
  } = useActiveSlide();

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician);

  const addSlideAttachment = useCallback(async (slide: ISlide): Promise<void> => {
    if (clinicalVersion?.id) {
      try {
        await zeroDashSdk.mtb.slides.addSlideAttachment(
          clinicalVersion?.id,
          slide.id,
          {
            fileId: file.fileId,
            fileType: file.fileType,
            title: file.title,
            width: file.width,
            caption: file.caption,
          },
        );
        getSlideFiles(slide.id);
      } catch {
        enqueueSnackbar('Could not add attachment to current slide, please try again');
      }
    }
  }, [
    enqueueSnackbar,
    file.caption,
    file.fileId,
    file.fileType,
    file.title,
    file.width,
    getSlideFiles,
    zeroDashSdk.mtb.slides,
    clinicalVersion?.id,
  ]);

  return (
    <Box display="flex" gap="16px" position="absolute" padding="4px">
      {activeSlide && canEditSlide && !isReadOnly && (
        <Tooltip title="Add to current slide" placement="top">
          <IconButton
            onClick={(): Promise<void> => addSlideAttachment(activeSlide)}
            disabled={attachments.some((a) => a.fileId === file.fileId)}
            sx={attachments.some((a) => a.fileId === file.fileId) ? {
              color: corePalette.green150,
              backgroundColor: corePalette.green10,
              '&:disabled': {
                color: corePalette.green150,
                backgroundColor: corePalette.green10,
              },
            } : {}}
          >
            {
              attachments.some((a) => a.fileId === file.fileId)
                ? <CheckIcon />
                : <PlusIcon />
            }
          </IconButton>
        </Tooltip>
      )}
      {canEditSlide && !isReadOnly && (
        <Tooltip title="Add to a new slide" placement="top">
          <IconButton
            onClick={(): void => (
              setAddNewSlideCallback(() => (
                (s: ISlide) => addSlideAttachment(s)
              ))
            )}
          >
            <CopyPlusIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
