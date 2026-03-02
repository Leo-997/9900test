import { Box, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CornerDownLeftIcon } from 'lucide-react';
import {
  Dispatch, SetStateAction, useMemo, useRef, useState, type JSX,
} from 'react';
import { CommentModes, IRTERef, RichTextEditor } from '@/components/Input/RichTextEditor/RichTextEditor';
import { IClinicalCommentWithBody } from '../../../../types/Comments/ClinicalComments.types';
import { ICurationCommentWithBody } from '../../../../types/Comments/CurationComments.types';
import CustomButton from '../../../Common/Button';
import CustomModal from '../../../Common/CustomModal';
import ModalWarningBox from '../../../Common/ModalWarningBox';

const useStyles = makeStyles(() => ({
  noBackground: {
    backgroundColor: 'inherit',
  },
}));

interface IProps<
  Comment extends ICurationCommentWithBody | IClinicalCommentWithBody,
> {
  comment: Comment;
  draftedComment?: string | null;
  onUpdate: (newComment: string, evidence?: string[], threadId?: string) => void;
  onCancel: () => void;
  onChange?: (newComment: string) => void;
  includeSaveInThread?: boolean;
  canEdit?: boolean;
  tooltipText?: {
    original?: string;
    duplicate?: string;
  };
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  commentMode?: CommentModes;
  hideComments?: boolean;
  condensed?: boolean;
}

export default function EditCommentInput<
  Comment extends ICurationCommentWithBody | IClinicalCommentWithBody,
>({
  comment,
  draftedComment,
  onUpdate,
  onCancel,
  onChange,
  includeSaveInThread = false,
  canEdit = true,
  tooltipText,
  isEditing,
  setIsEditing,
  commentMode = 'readOnly',
  hideComments = false,
  condensed = true,
}: IProps<Comment>): JSX.Element {
  const classes = useStyles();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const editorRef = useRef<IRTERef | null>(null);

  const countSamples = useMemo(() => {
    if ('countSamples' in comment) {
      return comment.countSamples;
    }
    if ('countClinicalVersions' in comment) {
      return comment.countClinicalVersions;
    }
    return 0;
  }, [comment]);

  const countString = useMemo(() => (
    `${
      comment.countEntities || 0
    } variant${
      comment.countEntities !== 1 ? 's' : ''
    } across ${
      countSamples || 0
    } sample${
      countSamples !== 1 ? 's' : ''
    }`
  ), [comment.countEntities, countSamples]);

  const handleSaveOriginal = (): void => {
    onUpdate(editorRef.current?.getContent() || '', editorRef.current?.getInlineCitations());
    editorRef.current?.save();
    setModalOpen(false);
    setIsEditing(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap="8px">
      <Box position="relative">
        <RichTextEditor
          key={comment.id}
          ref={editorRef}
          initialText={draftedComment || comment.comment}
          mode={isEditing ? 'manualSave' : 'readOnly'}
          hideActions
          commentMode={commentMode}
          hideComments={hideComments}
          onChange={(newVal): void => {
            setIsEmpty(editorRef.current?.isEmpty() ?? true);
            if (onChange && isEditing) {
              onChange(
                newVal,
              );
            }
          }}
          onSave={(newVal): void => {
            if (commentMode === 'edit' && !isEditing) {
              onUpdate(
                newVal,
                editorRef.current?.getInlineCitations(),
              );
            }
          }}
          disableSaveOnEmpty
          disablePlugins={[
            'text-bg',
            'text-colour',
            'table',
            'evidence',
          ]}
          condensed={!isEditing && condensed}
          classNames={{
            editor: !isEditing ? classes.noBackground : undefined,
          }}
        />
      </Box>
      {isEditing && (
        <Box
          display="flex"
          gap="8px"
          width="100%"
          justifyContent="flex-end"
        >
          <CustomButton
            variant="subtle"
            size="small"
            label="Cancel"
            onClick={(): void => {
              onCancel();
              editorRef.current?.reset(comment.comment);
              setIsEditing(false);
            }}
          />
          {includeSaveInThread && (
            <Tooltip
              title={tooltipText?.duplicate || 'Update the comment for this variant only'}
            >
              <span>
                <CustomButton
                  variant="text"
                  size="small"
                  label="Duplicate and save"
                  startIcon={<CornerDownLeftIcon />}
                  onClick={(): void => {
                    onUpdate(
                      editorRef.current?.getContent() || '',
                      editorRef.current?.getInlineCitations(),
                      comment.thread?.id,
                    );
                    editorRef.current?.save();
                    setIsEditing(false);
                  }}
                  disabled={!canEdit || isEmpty}
                />
              </span>
            </Tooltip>
          )}
          <Tooltip
            title={tooltipText?.original || `Update the comment in ${countString}`}
            disableFocusListener={!includeSaveInThread}
            disableHoverListener={!includeSaveInThread}
            disableTouchListener={!includeSaveInThread}
          >
            <span>
              <CustomButton
                variant="text"
                size="small"
                label={!includeSaveInThread ? 'Update' : 'Update original'}
                startIcon={<CornerDownLeftIcon />}
                onClick={(): void => {
                  if (!includeSaveInThread) {
                    handleSaveOriginal();
                  } else {
                    setModalOpen(true);
                  }
                }}
                disabled={!canEdit || isEmpty}
              />
            </span>
          </Tooltip>
        </Box>
      )}
      <CustomModal
        title="Update original comment"
        content={(
          <Box display="flex" flexDirection="column" gap="8px">
            {`Are you sure you want to update this comment? This comment will be updated in ${countString}.`}
            <br />
            This action cannot be undone.
            <ModalWarningBox
              summary="Update for this variant only?"
              message="If you would like to update the comment only for this variant or report, please use the 'Duplicate and Save' button."
            />
          </Box>
        )}
        open={modalOpen}
        onClose={(): void => setModalOpen(false)}
        onConfirm={handleSaveOriginal}
      />
    </Box>
  );
}
