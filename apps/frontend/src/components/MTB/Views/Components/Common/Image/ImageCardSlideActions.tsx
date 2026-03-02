import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import {
  Box,
  Menu,
  MenuItem,
  IconButton as MuiIconButton,
  styled,
} from '@mui/material';
import {
  EllipsisVerticalIcon,
  MaximizeIcon, MinusIcon, PlusIcon,
} from 'lucide-react';
import { useSnackbar } from 'notistack';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from 'react';
import { useActiveSlide } from '../../../../../../contexts/ActiveSlideContext';
import { useClinical } from '../../../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import { ISlideAttachment, UpdateSlideAttachmentDetails } from '../../../../../../types/MTB/MTB.types';
import ImageDetailEditingDialog from './ImageDetailEditingDialog';
import ImageFullScreenDialog from './ImageFullScreenDialog';

const IconButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.colours.core.white,
  padding: '5px',
}));

interface IProps {
  file: ISlideAttachment;
  condensed?: boolean;
  setCondensed?: Dispatch<SetStateAction<boolean>>;
}

export default function ImageCardSlideActions({
  file,
  condensed,
  setCondensed,
}: IProps): JSX.Element {
  const { enqueueSnackbar } = useSnackbar();
  const zeroDashSdk = useZeroDashSdk();

  const {
    isReadOnly,
    clinicalVersion,
    isPresentationMode,
    isAssignedCurator,
    isAssignedClinician,
  } = useClinical();
  const {
    slide,
    attachments,
    setAttachments,
  } = useActiveSlide();

  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [fullScreenModalOpen, setFullScreenModalOpen] = useState<boolean>(false);
  const [detailEditingModalOpen, setDetailEditingModalOpen] = useState<boolean>(false);
  const [minFileWidth, setMinFileWidth] = useState<number>(file.isAtBottom ? 2 : 4);

  const canEditSlide = useIsUserAuthorised('clinical.sample.assigned.write', isAssignedCurator, isAssignedClinician) && !isReadOnly;

  const currGroupAttachments = useMemo(
    () => (
      attachments.filter((a) => (
        a.sectionId === file.sectionId
        && a.isAtBottom === file.isAtBottom))
    ),
    [attachments, file.isAtBottom, file.sectionId],
  );

  const handleMove = (direction: 'up' | 'down'): void => {
    if (slide) {
      try {
        const newCurrGroupAttachments = [...currGroupAttachments];
        const idx = newCurrGroupAttachments.findIndex((a) => a.fileId === file.fileId);
        if (direction === 'up' && idx > 0) {
          [
            newCurrGroupAttachments[idx - 1],
            newCurrGroupAttachments[idx],
          ] = [
            newCurrGroupAttachments[idx],
            newCurrGroupAttachments[idx - 1],
          ];
        } else if (direction === 'down' && idx < newCurrGroupAttachments.length - 1) {
          [
            newCurrGroupAttachments[idx + 1],
            newCurrGroupAttachments[idx],
          ] = [
            newCurrGroupAttachments[idx],
            newCurrGroupAttachments[idx + 1],
          ];
        }
        zeroDashSdk.mtb.slides.updateSlideAttachmentOrder(
          clinicalVersion.id,
          slide.id,
          newCurrGroupAttachments.map((a, i) => ({
            id: a.fileId,
            order: i + 1,
          })),
        );
        const newAttachments = attachments
          .filter((a) => !(
            a.sectionId === file.sectionId
            && a.isAtBottom === file.isAtBottom
          ))
          .concat(newCurrGroupAttachments.map((a, i) => ({
            ...a,
            order: i + 1,
          })))
          .sort((a, b) => a.order - b.order);
        setAttachments(newAttachments);
      } catch (err) {
        enqueueSnackbar('Could not update image order, please try again', { variant: 'error' });
      }
    }
  };

  // Note: This fn is being used in two ways:
  // 1. As an onClick for updating image size
  // 2. As part of a useEffect when the slide layout is updated
  const handleUpdateSize = useCallback(async (
    img: ISlideAttachment,
    val?: 'increase' | 'decrease',
  ): Promise<void> => {
    if (slide && img.width) {
      // File width is used for the xs prop on a grid item
      // For vertical layout, min is 2, max is 12 (6 columns)
      // For horizontal layout, min is 4, max is 12 (3 columns)
      let newWidth = img.width;
      if (!val) newWidth = img.width < minFileWidth ? minFileWidth : img.width;
      if (val === 'increase') newWidth = img.width + 1 > 12 ? 12 : img.width + 1;
      if (val === 'decrease') newWidth = img.width - 1 < minFileWidth ? minFileWidth : img.width - 1;

      try {
        await zeroDashSdk.mtb.slides.updateSlideAttachmentSettings(
          clinicalVersion.id,
          slide.id,
          img.fileId,
          {
            width: newWidth,
          },
        );

        setAttachments((prev) => {
          const newAttachments = [...prev];
          const idx = newAttachments.findIndex((a) => a.fileId === img.fileId);

          if (idx !== -1) {
            newAttachments[idx] = {
              ...img,
              slideId: slide.id,
              isDeleted: false,
              width: newWidth,
            };
          }

          return newAttachments;
        });
      } catch (err) {
        enqueueSnackbar('Could not update image, please try again', { variant: 'error' });
      }
    }
  }, [
    clinicalVersion.id,
    enqueueSnackbar,
    minFileWidth,
    setAttachments,
    slide,
    zeroDashSdk.mtb.slides,
  ]);

  const handleCondense = async (): Promise<void> => {
    if (slide) {
      try {
        await zeroDashSdk.mtb.slides.updateSlideAttachmentSettings(
          clinicalVersion.id,
          slide?.id,
          file.fileId,
          {
            isCondensed: !condensed,
          },
        );

        setAttachments((prev) => {
          const newAttachments = [...prev];
          const idx = newAttachments.findIndex((a) => a.fileId === file.fileId);

          if (idx !== -1) {
            newAttachments[idx] = {
              ...file,
              slideId: slide.id,
              isDeleted: false,
              isCondensed: !condensed,
            };
          }

          return newAttachments;
        });

        if (setCondensed) {
          setCondensed((prev) => !prev);
        }
      } catch (err) {
        enqueueSnackbar('Could not update image, please try again', { variant: 'error' });
      }
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (slide) {
      try {
        const newAttachments = attachments
          .filter((a) => a.fileId !== file.fileId)
          .map((a) => (
            a.sectionId === file.sectionId
            && a.isAtBottom === file.isAtBottom
            && a.order > file.order
              ? {
                ...a,
                order: a.order - 1,
              }
              : a
          ))
          .sort((a, b) => a.order - b.order);
        await zeroDashSdk.mtb.slides.deleteFileBySlideId(
          clinicalVersion.id,
          slide.id,
          file.fileId,
        );
        await zeroDashSdk.mtb.slides.updateSlideAttachmentOrder(
          clinicalVersion.id,
          slide.id,
          newAttachments.map((a) => ({
            id: a.fileId,
            order: a.order,
          })),
        );
        setAttachments(newAttachments);
      } catch (err) {
        enqueueSnackbar('Could not remove image, please try again', { variant: 'error' });
      }
    }
  };

  const handleUpdateDetails = async (detail: UpdateSlideAttachmentDetails): Promise<void> => {
    if (slide) {
      try {
        const trimmedDetail = {
          title: detail.title.trim(),
          caption: detail.caption ? detail.caption.trim() : null,
        };
        await zeroDashSdk.mtb.slides.updateSlideAttachmentDetails(
          clinicalVersion.id,
          slide.id,
          file.fileId,
          trimmedDetail,
        );
        setAttachments((prevFiles) => prevFiles.map(
          (prevFile) => (
            prevFile.fileId === file.fileId ? { ...prevFile, ...trimmedDetail } : prevFile
          ),
        ));
        setDetailEditingModalOpen(false);
      } catch (err) {
        enqueueSnackbar('Could not update attachment detail, please try again', { variant: 'error' });
      }
    }
  };

  const handleUpdatePosition = async (): Promise<void> => {
    if (slide) {
      try {
        const nextGroupAttachments = attachments
          .filter((a) => a.sectionId === file.sectionId
          && a.isAtBottom !== file.isAtBottom);
        const newAttachments = attachments
          .map((a) => {
            if (a.fileId === file.fileId) {
              return {
                ...a,
                order: nextGroupAttachments.length + 1,
                isAtBottom: !a.isAtBottom,
              };
            }
            if (a.sectionId === file.sectionId
                && a.isAtBottom === file.isAtBottom
                && a.order > file.order) {
              return {
                ...a,
                order: a.order - 1,
              };
            }
            return a;
          })
          .sort((a, b) => a.order - b.order);
        await zeroDashSdk.mtb.slides.updateSlideAttachmentSettings(
          clinicalVersion.id,
          slide?.id,
          file.fileId,
          {
            isAtBottom: !file.isAtBottom,
          },
        );
        zeroDashSdk.mtb.slides.updateSlideAttachmentOrder(
          clinicalVersion.id,
          slide.id,
          newAttachments.map((a) => ({
            id: a.fileId,
            order: a.order,
          })),
        );
        setAttachments(newAttachments);
      } catch {
        enqueueSnackbar('Could not update attachment position, please try again', { variant: 'error' });
      }
    }
  };

  useEffect(() => {
    if (!slide) return;
    const newMinWidth = file.isAtBottom ? 2 : 4;
    setMinFileWidth(newMinWidth);
    setAttachments((prev) => prev.map((a) => {
      if (a.width < newMinWidth) {
        zeroDashSdk.mtb.slides.updateSlideAttachmentSettings(
          clinicalVersion.id,
          slide.id,
          a.fileId,
          {
            width: newMinWidth,
          },
        );
      }
      return {
        ...a,
        width: a.width < newMinWidth ? newMinWidth : a.width,
      };
    }));
  }, [clinicalVersion.id, file.isAtBottom, setAttachments, slide, zeroDashSdk.mtb.slides]);

  return (
    <Box
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      width="100%"
      position="absolute"
      top="0px"
      right="0px"
      padding="1px"
    >
      {isPresentationMode ? (
        <IconButton
          onClick={(): void => {
            setFullScreenModalOpen(true);
            setMenu(null);
          }}
        >
          <MaximizeIcon />
        </IconButton>
      ) : (
        <>
          <IconButton
            onClick={(): Promise<void> => handleUpdateSize(file, 'decrease')}
            disabled={!canEditSlide || file.width === minFileWidth}
          >
            <MinusIcon />
          </IconButton>
          <IconButton
            sx={{
              marginRight: 'auto',
              marginLeft: '5px',
            }}
            onClick={(): Promise<void> => handleUpdateSize(file, 'increase')}
            disabled={!canEditSlide || file.width === 12}
          >
            <PlusIcon />
          </IconButton>
          <IconButton
            onClick={(e): void => setMenu(e.currentTarget)}
          >
            <EllipsisVerticalIcon />
          </IconButton>
        </>
      )}
      <Menu
        id={`img-menu-${file.url}`}
        anchorEl={menu}
        open={Boolean(menu)}
        onClose={(): void => setMenu(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'left',
        }}
        variant="menu"
      >
        <MenuItem
          onClick={(): void => {
            setFullScreenModalOpen(true);
            setMenu(null);
          }}
        >
          Enter fullscreen
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            handleMove('up');
            setMenu(null);
          }}
          disabled={!canEditSlide || file.order === 1}
        >
          Move up
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            handleMove('down');
            setMenu(null);
          }}
          disabled={!canEditSlide || file.order === currGroupAttachments.length}
        >
          Move down
        </MenuItem>
        <MenuItem
          onClick={handleUpdatePosition}
          disabled={!canEditSlide}
        >
          Move to
          {' '}
          {file.isAtBottom ? 'the right' : 'bottom'}
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            setDetailEditingModalOpen(true);
            setMenu(null);
          }}
          disabled={!canEditSlide}
        >
          Edit details
        </MenuItem>
        <MenuItem
          onClick={handleCondense}
          disabled={!canEditSlide}
        >
          {condensed ? 'Show ' : 'Hide '}
          details
        </MenuItem>
        <MenuItem
          onClick={(): void => {
            handleDelete();
            setMenu(null);
          }}
          disabled={!canEditSlide}
        >
          Remove from slide
        </MenuItem>
      </Menu>
      <ImageFullScreenDialog
        open={fullScreenModalOpen}
        onClose={(): void => setFullScreenModalOpen(false)}
        file={file}
      />
      {detailEditingModalOpen && (
        <ImageDetailEditingDialog
          open={detailEditingModalOpen}
          onClose={(): void => setDetailEditingModalOpen(false)}
          onSave={handleUpdateDetails}
          file={file}
        />
      )}
    </Box>
  );
}
