import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
  Box, Dialog, IconButton, Switch,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { XIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type JSX } from 'react';
import { staticSlides } from '../../../../constants/Clinical/slide';
import { useClinical } from '../../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../../contexts/ZeroDashSdkContext';
import {
  IClinicalCommentWithBody,
  ISlideComment,
} from '../../../../types/Comments/ClinicalComments.types';
import { ISlide } from '../../../../types/MTB/Slide.types';
import { getSlideNameMapper } from '../../../../utils/functions/getSlideNameMapper';
import CustomTypography from '../../../Common/Typography';
import { ScrollableSection } from '../../../ScrollableSection/ScrollableSection';
import { CommentCard } from '../../Comment/CommentCard';
import { CommentEditorPanel } from '../../Comment/CommentEditorPanel';
import { DraggablePaperComponent } from '../../Comment/DraggablePaperComponent';

const useStyles = makeStyles(() => ({
  paperRoot: {
    position: 'absolute',
    top: '104px',
    right: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '0px',
    margin: '0px',
    minWidth: '400px',
    overflowY: 'visible',
    background: '#FFFFFF',
    boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
    borderRadius: '8px',
    height: 'calc(100% - 300px)',
    zIndex: 1100,
  },
  headerBox: {
    padding: '24px',
    gap: '8px',
    minWidth: '400px',
    height: '76px',
    background: '#F3F5F7',
    borderRadius: '8px 8px 0px 0px',
    cursor: 'move',
  },
  headerText: {
    height: '28px',
    color: '#022034',
  },
  commentBody: {
    padding: '32px 24px',
    gap: '24px',
    minWidth: '400px',
  },
  bottomBody: {
    boxSizing: 'border-box',
    padding: '16px 16px 24px',
    gap: '8px',
    minWidth: '400px',
    height: '216px',
    background: corePalette.grey10,
    borderTop: '1px solid #ECF0F3',
    borderRadius: '0px 0px 8px 8px',
    position: 'sticky',
    bottom: '0px',
  },
}));

interface IProps {
  open: boolean;
  onModalClose: () => void;
}

export function SlideCommentModal({
  open,
  onModalClose,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const {
    clinicalVersion,
    activeView,
    isReadOnly,
  } = useClinical();

  const [comments, setComments] = useState<ISlideComment[]>([]);
  const [slides, setSlides] = useState<ISlide[]>([]);
  const [presentedSlide, setPresentedSlide] = useState<ISlide>();
  const [showResolved, setShowResolved] = useState<boolean>(false);

  const canAddComment = useIsUserAuthorised('common.sample.suggestion.write') && !isReadOnly;

  // mapped the slide title to comments
  const addTitleToComments = useCallback(
    async (data: ISlideComment[]) => {
      const titleMappedComments = data.map(async (comment: ISlideComment) => {
        if (
          comment.thread?.entityId
          && !staticSlides.some((slide) => slide === comment.thread?.entityId)
        ) {
          const slide = await zeroDashSdk.mtb.slides.getSlideById(
            clinicalVersion.id,
            comment.thread.entityId,
          );
          return {
            ...comment,
            entityTitle: slide.title
              ? getSlideNameMapper(undefined, slide.title)
              : 'Untitled slide',
            index: slide.index,
          };
        }
        return {
          ...comment,
          entityTitle: getSlideNameMapper(comment.thread?.entityId || 'SLIDE'),
        };
      });
      return Promise.all(titleMappedComments);
    },
    [zeroDashSdk.mtb.slides, clinicalVersion.id],
  );

  const getSlideComments = useCallback(async () => {
    const resp = await zeroDashSdk.mtb.comment.getCommentThreads(
      {
        clinicalVersionId: clinicalVersion.id,
        threadType: ['SLIDE'],
        entityType: ['SLIDE'],
        includeComments: true,
      },
    );

    // Each slide has its own thread, each with it's own set of comments
    // Additionally each thread needs to know the slide title
    // This will merge all the comments to a single list and add the title to the comment
    const syncTitleMappedComments = await addTitleToComments(
      resp.reduce<IClinicalCommentWithBody[]>(
        (prev, thread) => ([
          ...prev,
          ...(
            thread.comments?.map((c) => ({
              ...c,
              comment: c.versions[0].comment,
            })) || []
          ),
        ]),
        [],
      ),
    );
    setComments(syncTitleMappedComments);
  }, [addTitleToComments, clinicalVersion.id, zeroDashSdk.mtb.comment]);

  const getAllSlidesByVersionId = useCallback(async () => {
    const resp = await zeroDashSdk.mtb.slides.getSlidesByVersionId(
      clinicalVersion.id,
    );
    setSlides(resp);
  }, [clinicalVersion.id, zeroDashSdk.mtb.slides]);

  const getRelevantSlide = useCallback(async () => {
    switch (activeView) {
      case 'OVERVIEW':
      case 'CLINICAL_INFORMATION':
      case 'MOLECULAR_FINDINGS':
      case 'DISCUSSION':
        setPresentedSlide(undefined);
        break;
      default: {
        const slide = slides.find((item) => item.id === activeView);
        if (slide) setPresentedSlide(slide);
        break;
      }
    }
  }, [activeView, slides]);

  useEffect(() => {
    getSlideComments();
  }, [getSlideComments]);

  useEffect(() => {
    getAllSlidesByVersionId();
    return () => setSlides([]);
  }, [getAllSlidesByVersionId]);

  useEffect(() => {
    getRelevantSlide();
    return () => setPresentedSlide(undefined);
  }, [getRelevantSlide]);

  return (
    <Dialog
      PaperComponent={DraggablePaperComponent}
      PaperProps={{
        sx: {
          position: 'absolute',
          top: '104px',
          right: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '0px',
          margin: '0px',
          minWidth: '400px',
          overflowY: 'visible',
          background: '#FFFFFF',
          boxShadow: '0px 16px 32px rgba(18, 47, 92, 0.16)',
          borderRadius: '8px',
          height: 'calc(100% - 300px)',
          zIndex: 1100,
        },
      }}
      hideBackdrop
      disableEnforceFocus
      disableScrollLock
      style={{ position: 'initial' }}
      open={open}
    >
      {/* Header */}
      <Box
        aria-labelledby="draggable-dialog"
        id="draggable-dialog"
        className={classes.headerBox}
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <CustomTypography variant="titleRegular" fontWeight="500">
          Comments
        </CustomTypography>
        <IconButton onClick={onModalClose}>
          <XIcon />
        </IconButton>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        paddingY="12px"
        gap="8px"
      >
        <CustomTypography variant="bodySmall" style={{ marginLeft: '24px' }}>
          Show resolved comments
        </CustomTypography>
        <Switch
          value={showResolved}
          onClick={(): void => setShowResolved((prev) => !prev)}
        />
      </Box>

      {/* Comment roller body */}
      <ScrollableSection
        style={{
          // 216 is the height of the input box
          height: canAddComment ? 'calc(100% - 216px)' : '100%',
          overflowY: 'visible',
          width: '100%',
        }}
      >
        <Box
          className={classes.commentBody}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          {comments
            .filter((comment) => (showResolved ? comment.isResolved : !comment.isResolved))
            .sort((a, b) => dayjs(b.createdAt || undefined).diff(a.createdAt || undefined))
            .map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                setComments={setComments}
              />
            ))}
        </Box>
      </ScrollableSection>

      {/* Bottom body */}
      {canAddComment && (
        <Box
          className={classes.bottomBody}
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
        >
          <CommentEditorPanel
            key={`editor-panel-${open}`}
            slide={presentedSlide}
            onSubmit={getSlideComments}
          />
        </Box>
      )}
    </Dialog>
  );
}
