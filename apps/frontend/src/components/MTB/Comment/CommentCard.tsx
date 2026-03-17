import CustomChip from '@/components/Common/Chip';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { corePalette } from '@/themes/colours';
import {
  Box, IconButton, Menu, MenuItem,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { CheckIcon, EllipsisVerticalIcon, Link2Icon } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { Dispatch, SetStateAction, useMemo, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import { useClinical } from '../../../contexts/ClinicalContext';
import { useUser } from '../../../contexts/UserContext';
import { useZeroDashSdk } from '../../../contexts/ZeroDashSdkContext';
import { ISlideComment } from '../../../types/Comments/ClinicalComments.types';
import getCommenter from '../../../utils/functions/getCommenter';
import CustomTypography from '../../Common/Typography';

const useStyles = makeStyles(() => ({
  commentCard: {
    padding: '0px',
    gap: '8px',
    width: '352px',
    minHeight: '120px',
    position: 'relative',
  },
  cardHeader: {
    height: '20px',
    fontWeight: 700,
    color: '#022034',
  },
  slideText: {
    minWidth: '132px',
    height: '20px',
    fontSize: '12px',
    letterSpacing: '0.25px',
    color: corePalette.green150,
    textDecoration: 'none',
  },
  commentTime: {
    minWidth: '146px',
    height: '16px',
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: '16px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: '#62728C',
  },
  divider: {
    marginTop: '16px',
    minWidth: '352px',
    border: '1px dashed #D0D9E2',
  },
  links: {
    textDecoration: 'none',
    maxWidth: '300px',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      textDecoration: 'underline',
      color: corePalette.green150,
    },
  },
  btnText: {
    textTransform: 'none',
    fontWeight: 500,
    color: '#00AB59',
  },
  resolvedBtn: {
    marginRight: '6px',
    backgroundColor: '#E4F9EE80',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:disabled': {
      backgroundColor: '#E4F9EE80',
    },
  },
  menuItem: {
    padding: '12px',
  },
}));

interface IProps {
  comment: ISlideComment;
  setComments: Dispatch<SetStateAction<ISlideComment[]>>;
}

export function CommentCard({
  comment,
  setComments,
}: IProps): JSX.Element {
  const classes = useStyles();
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const {
    currentUser,
    users,
  } = useUser();
  const {
    mtbBaseUrl,
  } = useClinical();

  const [commentMenu, setCommentMenu] = useState<HTMLElement | null>(null);

  const canResolveComment = useIsUserAuthorised('common.sample.suggestion.write');

  const slideUrl = useMemo(
    () => `/${mtbBaseUrl}/${comment.thread?.entityId}`,
    [comment.thread?.entityId, mtbBaseUrl],
  );

  const handleResolve = async (): Promise<void> => {
    try {
      await zeroDashSdk.mtb.comment.updateComment(
        comment.id,
        {
          isResolved: !comment.isResolved,
        },
        comment.thread?.id,
      );
      setComments((prev) => {
        const newComments = [...prev];
        const commentIndex = newComments.findIndex((c) => c.id === comment.id);

        if (commentIndex !== -1) {
          newComments[commentIndex] = {
            ...comment,
            isResolved: !comment.isResolved,
          };
        }

        return newComments;
      });
    } catch (err) {
      enqueueSnackbar('Could not resolve comment, please try again.', { variant: 'error' });
    }
  };

  const createdByUser = useMemo(() => (
    users.find((u) => u.id === comment.createdBy)
  ), [comment.createdBy, users]);

  return (
    <Box
      className={classes.commentCard}
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
    >
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="flex-start"
        alignItems="center"
        width="100%"
      >
        <CustomTypography fontWeight="bold" variant="bodySmall">
          {getCommenter(
            comment,
            createdByUser,
            currentUser?.id,
          )}
        </CustomTypography>
        <span style={{ marginLeft: 'auto' }}>
          {comment.isResolved && (
            <CustomChip
              pill
              size="small"
              label="Resolved"
              backgroundColour={corePalette.green10}
              colour={corePalette.green150}
              icon={<CheckIcon width="16px" height="16px" color={corePalette.green150} />}
            />
          )}
          <IconButton
            onClick={(e): void => setCommentMenu(e.currentTarget)}
            sx={{ marginLeft: '8px' }}
          >
            <EllipsisVerticalIcon />
          </IconButton>
        </span>
      </Box>
      <RichTextEditor initialText={comment.comment} mode="readOnly" condensed />
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        gap="8px"
      >
        <Link2Icon height="20px" width="20px" color={corePalette.green150} />
        <Link
          to={slideUrl}
          className={classes.links}
        >
          <CustomTypography lineHeight="130%" className={classes.slideText} truncate>
            Slide:
            {' '}
            {comment.entityTitle || 'Untitled slide'}
          </CustomTypography>
        </Link>
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-start"
        width="100%"
      >
        <CustomTypography variant="label" color={corePalette.grey100}>
          {comment.createdAt
            ? dayjs(comment.createdAt).format('DD/MM/YYYY[, ]h:mm A')
            : 'Date Unknown'}
        </CustomTypography>
      </Box>
      <Box className={classes.divider} />
      <Menu
        id="edit-menu"
        anchorEl={commentMenu}
        open={Boolean(commentMenu)}
        onClose={(): void => setCommentMenu(null)}
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
          className={classes.menuItem}
          onClick={handleResolve}
          disabled={!canResolveComment}
        >
          Mark as
          {comment.isResolved ? ' un' : ' '}
          resolved
        </MenuItem>
      </Menu>
    </Box>
  );
}
