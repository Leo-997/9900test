import { Tooltip } from '@mui/material';
import Box from '@mui/material/Box';
import { createStyles, makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { ArrowRightIcon, BookOpenTextIcon } from 'lucide-react';
import { useMemo, useState, type JSX } from 'react';
import { germlineCommentTags, molecularCommentTags } from '@/constants/Curation/comments';
import { clinicalCommentTags } from '@/constants/Clinical/comments';
import { useUser } from '../../../contexts/UserContext';
import { ICommentActions, ICommentTagOption } from '../../../types/Comments/CommonComments.types';
import { CurationCommentTypes, ICurationCommentWithBody } from '../../../types/Comments/CurationComments.types';
import getCommenter from '../../../utils/functions/getCommenter';
import CustomButton from '../../Common/Button';
import CustomTypography from '../../Common/Typography';
import { CommentActions } from './Actions/CommentActions';
import EditCommentInput from './Input/EditCommentInput';
import CommentTag from './Tags/CommentTag';

const useStyles = makeStyles(() => createStyles({
  root: {
    position: 'relative',
    overflow: 'unset',
    width: '100%',
    marginBottom: 12,

    '&:hover': {
      backgroundColor: '#FAFBFC',
    },
  },
  header: {
    padding: 8,
  },
  content: {
    position: 'relative',
    padding: '0px 8px',
    paddingBottom: '4px !important',
  },
  actions: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 6,
    padding: 7,
    backgroundColor: '#FFF',
    border: '1px solid #ECF0F3',
    top: -20,
    right: 0,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  actionsSpacing: {
    marginLeft: 0,
  },
  input: {
    backgroundColor: 'inherit',
    paddingTop: 10,
  },
  markdown: {
    paddingBottom: 4,

    '& p': {
      fontSize: 16,
      margin: '8px 0 0 0',
    },
  },
  flexSpan: {
    display: 'flex',
  },
}));

interface IProps {
  comment: ICurationCommentWithBody;
  // action props
  actions: ICommentActions;
  permissions: ICommentActions;
  onEdit?: (
    body: Pick<ICurationCommentWithBody, 'comment' | 'type' | 'evidence'>,
    evidence?: string[],
    threadId?: string,
  ) => Promise<void>;
  isReadOnly?: boolean;
  onHide?: (hide: boolean) => void;
  onDelete?: () => void;
  onChangeOrder?: (
    operation: 'new' | 'up' | 'down' | 'remove',
  ) => void;
  onAddEvidence?: () => void;
  onAddLineBreak?: () => void;
  showOrder?: boolean;
  tagOptions: ICommentTagOption<CurationCommentTypes>[]
}

export function CommentCard({
  comment,
  onEdit,
  actions,
  permissions,
  onHide,
  onDelete,
  onChangeOrder,
  onAddEvidence,
  onAddLineBreak,
  showOrder,
  isReadOnly = false,
  tagOptions,
}: IProps): JSX.Element {
  const classes = useStyles();

  const { currentUser, users } = useUser();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [showActions, setShowActions] = useState<boolean>(false);
  const [newType, setNewType] = useState<typeof comment.type>(comment.type);

  const tag = useMemo(() => (
    [
      ...molecularCommentTags,
      ...germlineCommentTags,
      ...clinicalCommentTags,
    ].find((t) => t.value === comment.type)
  ), [comment.type]);

  const updatedByUser = useMemo(() => (
    users.find((u) => u.id === comment.updatedBy)
  ), [comment.updatedBy, users]);

  const createdByUser = useMemo(() => (
    users.find((u) => u.id === comment.createdBy)
  ), [comment.createdBy, users]);

  const handleShowActions = (): void => {
    if (
      Object.entries(actions)
        .some(([key, value]) => key !== 'review' && value)
    ) {
      setShowActions(true);
    }
  };

  const handleHideActions = (): void => {
    if (
      Object.entries(actions)
        .some(([key, value]) => key !== 'review' && value)
    ) {
      setShowActions(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      padding="8px"
      className={classes.root}
      onMouseOver={handleShowActions}
      onMouseLeave={handleHideActions}
    >
      <Box display="flex" justifyContent="space-between">
        <CustomTypography
          variant="bodyRegular"
          fontWeight="bold"
        >
          {getCommenter(
            comment,
            createdByUser,
            currentUser?.id,
          )}
        </CustomTypography>
        <Box display="flex" gap="8px" alignItems="center">
          { comment.updatedBy
            && comment.updatedBy !== comment.createdBy
            && dayjs(comment.updatedAt).diff(dayjs(comment.createdAt)) > 0
            && (
              <Tooltip
                title={(
                  <>
                    Updated by
                    {' '}
                    {getCommenter(
                      comment,
                      updatedByUser,
                      currentUser?.id,
                      true,
                    )}
                    {' '}
                    on
                    {' '}
                    {comment.updatedAt ? dayjs(comment.updatedAt).format('DD/MM/YYYY, hh:mm A') : 'Date Unknown'}
                  </>
                )}
              >
                <span className={classes.flexSpan}>
                  <CustomTypography
                    style={{ color: 'rgba(98, 114, 140, 1)' }}
                    variant="label"
                  >
                    (Edited)
                  </CustomTypography>
                </span>
              </Tooltip>
            )}
          <CustomTypography
            style={{ color: 'rgba(98, 114, 140, 1)' }}
            variant="label"
          >
            {comment.originalCreatedAt ? dayjs(comment.originalCreatedAt).format('DD/MM/YYYY, h:mm A') : 'Date Unknown'}
          </CustomTypography>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box
          display="flex"
          flexDirection="column"
          gap={isEdit ? '8px' : undefined}
          width="100%"
        >
          {(comment.reportOrder || tag) && (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {comment.reportOrder ? (
                <CustomTypography variant="label">
                  Number
                  {' '}
                  <span style={{ color: tag?.color }}>{comment.reportOrder}</span>
                  {' '}
                  in report
                  {'reportLineBreak' in comment && comment.reportLineBreak && <span style={{ color: tag?.color }}> (line break)</span>}
                </CustomTypography>
              ) : (
                <div />
              )}
              {tag && (
                <CommentTag
                  commentType={newType}
                  isEdit={isEdit}
                  handleSetTag={(newTag): void => setNewType(newTag.value)}
                  tagOptions={tagOptions}
                />
              )}
            </Box>
          )}
          <EditCommentInput
            comment={comment}
            onUpdate={(newComment, evidence, threadId): void => {
              if (onEdit) {
                onEdit({
                  comment: newComment,
                  type: newType,
                }, evidence, threadId);
              }
            }}
            onCancel={(): void => setIsEdit(false)}
            includeSaveInThread
            canEdit={permissions.edit}
            isEditing={isEdit}
            setIsEditing={setIsEdit}
            commentMode={permissions.review && actions.review ? 'edit' : 'readOnly'}
            hideComments={!actions.review}
          />
          <Box
            display="flex"
            gap="5px"
          >
            {comment.evidence?.length && !isEdit && permissions.evidence ? (
              <Box display="flex">
                <CustomButton
                  size="small"
                  variant="text"
                  disableRipple
                  onClick={onAddEvidence}
                  label={`${comment.evidence.length} citation${comment.evidence.length !== 1 ? 's' : ''} linked`}
                  startIcon={<BookOpenTextIcon />}
                  endIcon={<ArrowRightIcon />}
                />
              </Box>
            ) : <div />}
          </Box>
        </Box>
      </Box>
      {showActions && !isReadOnly && (
        <Box position="absolute" top="-20px" right="0px">
          <CommentActions
            isHidden={Boolean(comment.isHiddenInThread)}
            actions={actions}
            permissions={permissions}
            onEdit={(): void => setIsEdit(true)}
            onDelete={onDelete}
            onHide={onHide}
            onChangeOrder={onChangeOrder}
            showOrder={showOrder}
            reportOrder={comment.reportOrder}
            hasLineBreak={'reportLineBreak' in comment && comment.reportLineBreak}
            onAddEvidence={onAddEvidence}
            onAddLineBreak={onAddLineBreak}
          />
        </Box>
      )}
    </Box>
  );
}
