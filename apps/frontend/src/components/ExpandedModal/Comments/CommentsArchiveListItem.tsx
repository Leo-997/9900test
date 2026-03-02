import Box from '@mui/material/Box';
import { useEffect, useMemo, useRef, useState, type JSX } from 'react';

import DualLabelChip from '@/components/Chips/DualLabelChip';
import { RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { corePalette } from '@/themes/colours';
import mapEntityType from '@/utils/functions/mapEntityType';
import {
  Divider,
  IconButton,
  ListItem,
  ListItemText,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import {
  ArrowRightIcon,
  BookOpenTextIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckBigIcon,
  EllipsisVerticalIcon,
  EyeOffIcon,
  PlusCircleIcon,
} from 'lucide-react';
import { useUser } from '../../../contexts/UserContext';
import { ClinicalThreadEntityTypes, IClinicalCommentWithBody } from '../../../types/Comments/ClinicalComments.types';
import { ICommentTagOption } from '../../../types/Comments/CommonComments.types';
import { CurationThreadEntityTypes, ICurationCommentWithBody } from '../../../types/Comments/CurationComments.types';
import getCommenter from '../../../utils/functions/getCommenter';
import CustomButton from '../../Common/Button';
import CommonActionsMenu from '../../Common/CommonActionsMenu';
import CustomModal from '../../Common/CustomModal';
import CustomTypography from '../../Common/Typography';
import EditCommentInput from './Input/EditCommentInput';
import RelatedThreadsModal from './RelatedThreadsModal';
import CommentTag from './Tags/CommentTag';

const useStyles = makeStyles(() => ({
  container: {
    position: 'relative',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& .MuiListItem-container': {
      listStyleType: 'none',
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '&:hover': {
      backgroundColor: 'unset',
    },
  },
  searchIcon: {
    marginRight: 26,
  },
  primaryText: {
    color: '#022034',
    fontWeight: 700,
  },
  secondaryText: {
    color: '#022034',
  },
  icon: {
    padding: 0,
    width: 32,
    height: 32,
  },
  comment: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '& p': {
      whiteSpace: 'pre-wrap',
      fontSize: 16,
      margin: '8px 0 0 0',
    },
  },
  divider: {
    border: '1px solid #D0D9E2',
    opacity: '0.24',
    width: '100%',
  },
  input: {
    backgroundColor: 'inherit',
  },
}));

interface IPermissions {
  canAdd: boolean;
  canRemove: boolean;
  edit: boolean;
  hide: boolean;
  delete: boolean;
}

interface IProps<
  Comment extends ICurationCommentWithBody | IClinicalCommentWithBody,
  Type extends Comment['type'] = Comment['type'],
> {
  comment: Comment;
  onSelect: () => void;
  isSelected: boolean;
  isPrevAddedComment: boolean;

  // action props
  permissions: IPermissions;
  canHideComments: boolean;
  onEdit?: (
    body: Pick<Comment, 'comment' | 'type'>,
    evidence?: string[]
  ) => Promise<void>;
  onHide?: (hide: boolean) => void;
  onDelete?: () => void;
  tagOptions: ICommentTagOption<Type>[];
  onAddEvidence?: () => void;
}

export function CommentsArchiveListItem<
  Comment extends ICurationCommentWithBody | IClinicalCommentWithBody,
  Type extends Comment['type'] = Comment['type'],
>({
  comment,
  onSelect,
  isSelected,
  isPrevAddedComment = false,
  permissions,
  canHideComments,
  onEdit,
  onHide,
  onDelete,
  tagOptions,
  onAddEvidence,
}: IProps<Comment, Type>): JSX.Element {
  const classes = useStyles();
  const { currentUser, users } = useUser();

  const [isExpanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [newType, setNewType] = useState<typeof comment.type>(comment.type);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [showThreadsModal, setShowThreadsModal] = useState<boolean>(false);

  const commentRef = useRef<HTMLDivElement | null>(null);

  const createdByUser = useMemo(() => (
    users.find((u) => u.id === comment.originalCreatedBy)
  ), [comment.originalCreatedBy, users]);

  const latestVersion = useMemo(() => {
    if ('versions' in comment && comment.versions.length) {
      return comment.versions[0];
    }
    return null;
  }, [comment]);

  const latestVersionUserName = useMemo(() => {
    if (latestVersion) {
      const user = users.find((u) => u.id === latestVersion.createdBy);
      if (user) {
        return currentUser && user.id === currentUser.id ? 'Me' : `${user.familyName} ${user.givenName}`;
      }
    }
    return '';
  }, [currentUser, latestVersion, users]);

  const countSamples = useMemo(() => {
    if ('countSamples' in comment) {
      return comment.countSamples;
    }
    if ('countClinicalVersions' in comment) {
      return comment.countClinicalVersions;
    }
    return 0;
  }, [comment]);

  useEffect(() => {
    const firstChild = commentRef.current?.firstChild as HTMLElement | null;
    if ((firstChild?.scrollHeight || 0) > (commentRef.current?.clientHeight || 0)) {
      setIsTruncated(true);
    }
  }, []);

  const getRelatedThreadsChips = (): JSX.Element | null => {
    if (comment.relatedThreads?.length) {
      // Filter out duplicate threads that share entityType and zero2FinalDiagnosis
      const filteredThreads = Array.from(new Set(
        comment.relatedThreads.map((rt) => `${rt.zero2FinalDiagnosis}@${rt.entityType}`),
      ));

      return (
        <>
          {filteredThreads.slice(0, 2).map((thread) => {
            const formattedThread = thread.split('@');
            return (
              <DualLabelChip
                key={thread}
                primaryText={formattedThread[0]}
                secondaryText={mapEntityType(
                  formattedThread[1] as CurationThreadEntityTypes | ClinicalThreadEntityTypes,
                )}
              />
            );
          })}
          {filteredThreads.length > 2 && (
            <DualLabelChip
              secondaryText={`+ ${filteredThreads.length - 2} more`}
            />
          )}
          <CustomButton
            variant="text"
            size="small"
            label="See details"
            onClick={(): void => setShowThreadsModal && setShowThreadsModal(true)}
          />
        </>
      );
    }

    return null;
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex={1}
      className={classes.container}
    >
      <ListItem className={classes.container}>
        <Box display="flex" flexDirection="row" flex={1} width="100%">
          <Box flex={1} width="calc(100% - 40px)">
            <Box
              display="flex"
              flex={1}
              flexDirection="row"
              justifyContent="space-between"
              paddingRight="16px"
              width="100%"
            >
              <ListItemText
                primary={(
                  <Box display="flex" gap="16px" alignItems="center">
                    <CustomTypography
                      truncate
                      fontWeight="medium"
                      variant="bodyRegular"
                    >
                      {latestVersionUserName
                        ? `Created by ${latestVersionUserName}`
                        : `Originally created by ${getCommenter(
                          comment,
                          createdByUser,
                          currentUser?.id,
                        )}`}
                    </CustomTypography>
                    <CustomTypography variant="bodySmall" truncate>
                      {dayjs(latestVersion?.createdAt ?? comment.originalCreatedAt).format('DD/MM/YYYY [at] h:mm a')}
                    </CustomTypography>
                  </Box>
                )}
              />
              <Box display="flex" gap="16px" alignItems="center">
                <CommentTag
                  commentType={newType}
                  isEdit={isEdit}
                  handleSetTag={(tag): void => setNewType(tag.value)}
                  tagOptions={tagOptions}
                />
                {comment.isHiddenInArchive && (
                <EyeOffIcon />
                )}
              </Box>
            </Box>
            {!isEdit && comment.relatedThreads?.length ? (
              <Box
                marginBottom="5px"
                display="flex"
                alignItems="center"
                gap="4px"
              >
                {getRelatedThreadsChips()}
              </Box>
            ) : null}
            {isEdit ? (
              <EditCommentInput
                comment={comment}
                onUpdate={(newComment, evidence): void => {
                  if (onEdit) {
                    onEdit({ comment: newComment, type: newType }, evidence);
                  }
                  setIsEdit(false);
                }}
                onCancel={(): void => setIsEdit(false)}
                canEdit={permissions.edit}
                isEditing={isEdit}
                setIsEditing={setIsEdit}
                hideComments
              />
            ) : (
              <>
                <div
                  ref={commentRef}
                  style={{
                    maxHeight: isExpanded ? undefined : '55px',
                    overflow: isExpanded ? undefined : 'hidden',
                  }}
                >
                  <RichTextEditor
                    key={comment.comment}
                    initialText={comment.comment}
                    mode="readOnly"
                    commentMode="readOnly"
                    hideComments
                    classNames={{
                      editor: classes.input,
                    }}
                    condensed
                  />
                </div>
                {isTruncated && (
                  <CustomButton
                    variant="text"
                    size="small"
                    onClick={(): void => setExpanded(!isExpanded)}
                    label={isExpanded ? 'Show less' : 'Show more'}
                    endIcon={
                      isExpanded
                        ? <ChevronUpIcon />
                        : <ChevronDownIcon />
                    }
                  />
                )}
              </>
            )}
            {comment.evidence?.length && !isEdit ? (
              <CustomButton
                size="small"
                variant="text"
                disableRipple
                onClick={onAddEvidence}
                label={`${comment.evidence.length} citation${comment.evidence.length !== 1 ? 's' : ''} linked`}
                startIcon={<BookOpenTextIcon style={{ position: 'relative', top: -1 }} />}
                endIcon={<ArrowRightIcon />}
              />
            ) : <div />}
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minWidth="40px"
            gap="8px"
          >
            <IconButton
              style={{
                padding: '6px',
              }}
              onClick={(e): void => setMenuAnchorEl(e.currentTarget)}
            >
              <EllipsisVerticalIcon />
            </IconButton>
            <IconButton
              className={classes.icon}
              sx={{ transition: 'all cubic-bezier(.19,1,.22,1) 0.7s', padding: '6px' }}
              onClick={(): void => onSelect()}
              disabled={(isSelected && !permissions.canRemove) || !permissions.canAdd}
            >
              {isSelected ? (
                <CircleCheckBigIcon fill={corePalette.blank} stroke={corePalette.green150} />
              ) : (
                <PlusCircleIcon />
              )}
            </IconButton>
          </Box>
        </Box>
      </ListItem>
      <Divider className={classes.divider} />
      <CommonActionsMenu
        isHidden={comment.isHiddenInArchive}
        actions={{
          edit: true,
          hide: true,
          delete: true,
        }}
        permissions={{
          edit: comment.originalCreatedBy === currentUser?.id && !isPrevAddedComment,
          hide: canHideComments || (
            comment.originalCreatedBy === currentUser?.id && !isPrevAddedComment
          ),
          delete: comment.originalCreatedBy === currentUser?.id && !isPrevAddedComment,
        }}
        anchorEl={menuAnchorEl}
        onClose={(): void => setMenuAnchorEl(null)}
        onEdit={(): void => setIsEdit(true)}
        onHide={(): void => {
          if (onHide) {
            onHide(!comment.isHiddenInArchive);
          }
        }}
        onDelete={(): void => setDeleteConfirmOpen(true)}
      />
      <CustomModal
        title="Delete comment"
        content={
          `Are you sure you want to delete this comment? This comment is currently used ${
            comment.countEntities || 0
          } time${
            comment.countEntities !== 1 ? 's' : ''
          } across ${
            countSamples || 0
          } sample${
            countSamples !== 1 ? 's' : ''
          }.\nThis action cannot be undone.`
        }
        open={deleteConfirmOpen}
        onClose={(): void => setDeleteConfirmOpen(false)}
        onConfirm={(): void => {
          if (onDelete) {
            onDelete();
          }
          setDeleteConfirmOpen(false);
        }}
        variant="alert"
        buttonText={{
          cancel: 'No, don\'t delete',
          confirm: 'Yes, delete',
        }}
      />
      {showThreadsModal && comment.relatedThreads && (
        <RelatedThreadsModal
          open={showThreadsModal}
          onClose={(): void => setShowThreadsModal(false)}
          threads={comment.relatedThreads}
          isClinicalComment={('countClinicalVersions' in comment)}
        />
      )}
    </Box>
  );
}
