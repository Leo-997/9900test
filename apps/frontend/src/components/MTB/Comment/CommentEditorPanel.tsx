import { IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { corePalette } from '@/themes/colours';
import { Box, IconButton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Link2Icon, SendHorizonalIcon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useRef, useState, type JSX } from 'react';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { EntityType } from '../../../types/MTB/Comment.types';
import { ISlide } from '../../../types/MTB/Slide.types';
import { getSlideNameMapper } from '../../../utils/functions/getSlideNameMapper';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  bottomHeaderText: {
    height: '20px',
    fontWeight: 700,
    color: '#022034',
  },
  slideText: {
    minWidth: '180px',
    height: '20px',
    fontSize: '12px',
    lineHeight: '20px',
    letterSpacing: '0.25px',
    color: corePalette.green150,
  },
  commentPanel: {
    padding: '8px 12px',
    width: '368px',
    height: '120px',
    background: '#FFFFFF',
    border: '1px solid #D0D9E2',
    borderRadius: '4px',
  },
  editor: {
    minWidth: '344px',
    height: '80px',
    border: 'none',
    padding: '0px',
  },
}));
interface IProps {
  onSubmit: () => void;
  slide?: ISlide;
}

export function CommentEditorPanel({
  onSubmit,
  slide,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    clinicalVersion,
    activeView,
  } = useClinical();

  const [newComment, setNewComment] = useState<string>('');

  const editorRef = useRef<IRTERef | null>(null);

  const parseEntityType = (): EntityType => {
    switch (activeView) {
      case 'OVERVIEW':
      case 'CLINICAL_INFORMATION':
      case 'MOLECULAR_FINDINGS':
      case 'DISCUSSION':
        return activeView as EntityType;
      default:
        return 'SLIDE';
    }
  };

  const submitComment = async (): Promise<void> => {
    if (newComment.trim() !== '') {
      const res = await zeroDashSdk.mtb.comment.createComment(
        {
          comment: newComment,
          type: 'SLIDE',
          thread: {
            clinicalVersionId: clinicalVersion.id,
            entityType: 'SLIDE',
            threadType: 'SLIDE',
            entityId: parseEntityType() === 'SLIDE' && slide?.id
              ? slide.id
              : parseEntityType(),
          },
        },
      );
      if (res) {
        enqueueSnackbar('Comment posted successfully!', { variant: 'success' });
        setNewComment('');
        if (editorRef) {
          editorRef.current?.clear();
        }
        onSubmit();
      }
    } else {
      enqueueSnackbar('Cannot submit an empty comment', { variant: 'warning' });
    }
  };

  return (
    <>
      <CustomTypography variant="bodySmall" className={classes.bottomHeaderText}>
        Add a comment for this slide
      </CustomTypography>

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        gap="8px"
      >
        <Link2Icon height="20px" width="20px" color={corePalette.green150} />
        <CustomTypography lineHeight="130%" className={classes.slideText} truncate>
          Slide:
          {' '}
          {getSlideNameMapper(
            parseEntityType(),
            slide?.title || 'Untitled slide',
          )}
        </CustomTypography>
      </Box>
      <Box className={classes.commentPanel}>
        <RichTextEditor
          ref={editorRef}
          mode="autoSave"
          hideToolbar
          disablePlugins={['drag', 'table', 'evidence', 'inline-citation']}
          classNames={{
            editor: classes.editor,
          }}
          onChange={((value): void => setNewComment(editorRef.current?.isEmpty() ? '' : JSON.stringify(JSON.parse(value).value)))}
        />
        <IconButton
          onClick={submitComment}
          disabled={!newComment}
          sx={{
            position: 'absolute',
            right: 21,
            bottom: 27,
          }}
        >
          <SendHorizonalIcon color={!newComment ? corePalette.grey50 : corePalette.green150} />
        </IconButton>
      </Box>
    </>
  );
}
