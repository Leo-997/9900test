import {
  Box, IconButton, styled,
  Tooltip,
} from '@mui/material';
import {
  HistoryIcon,
  MoreVerticalIcon,
  PencilIcon, PlusIcon, Trash2Icon,
} from 'lucide-react';
import {
  JSX,
  ReactNode, useCallback, useEffect, useRef, useState,
} from 'react';
import CommonActionsMenu from '@/components/Common/CommonActionsMenu';
import CustomModal from '@/components/Common/CustomModal';
import CustomTypography from '@/components/Common/Typography';
import { AddCommentInput } from '@/components/ExpandedModal/Comments/Input/AddCommentInput';
import EditCommentInput from '@/components/ExpandedModal/Comments/Input/EditCommentInput';
import { localStorageKey } from '@/constants/Reports/reports';
import { useReport } from '@/contexts/Reports/CurrentReportContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useIsUserAuthorised } from '@/hooks/useIsUserAuthorised';
import { IClinicalCommentWithBody } from '@/types/Comments/ClinicalComments.types';
import { ICurationCommentWithBody } from '@/types/Comments/CurationComments.types';
import CustomButton from '../../../../../Common/Button';
import { MTBInterpretationVersions } from '../MTBInterpretationVersions';
import { ErrorMessageBox } from '../../Components/ErrorMessageBox';

const EditorRoot = styled(Box)(({ theme }) => ({
  position: 'relative',
  fontSize: '13px !important',
  lineHeight: '16px !important',
  '& *': {
    fontSize: '13px !important',
    lineHeight: '16px !important',
  },
  '& .typography-bodyDefault': {
    color: `${theme.colours.core.offBlack100} !important`,
  },
}));

interface IProps {
  comment?: ICurationCommentWithBody | IClinicalCommentWithBody;
  draftedCommentId?: string;
  title?: ReactNode;
  onSubmit: (
    newComment: string,
    evidence?: string[],
    threadId?: string,
  ) => void;
  onDelete?: () => void;
  archive?: ReactNode;
  additionalActions?: ReactNode;
  disabled?: boolean;
  hideComments?: boolean;
  alterationSection?: ReactNode;
  isInterpretation?: boolean;
  withCommentVersions?: boolean;
}

export default function GeneralReportComment({
  comment,
  draftedCommentId,
  title,
  onSubmit,
  onDelete,
  archive,
  additionalActions,
  disabled,
  hideComments = false,
  alterationSection,
  isInterpretation = false,
  withCommentVersions = false,
}: IProps): JSX.Element {
  const { isGeneratingReport } = useReport();
  const { unsavedCommentIds, setUnsavedCommentIds } = useReportData();

  const [commentsArchiveOpen, setCommentsArchiveOpen] = useState<boolean>(false);
  const [draftedComment, setDraftedComment] = useState<string | null>(() => {
    const savedComments = localStorage.getItem(localStorageKey);
    if (savedComments && draftedCommentId) {
      const parsedComments = JSON.parse(savedComments);
      return parsedComments[draftedCommentId] ?? null;
    }
    return null;
  });
  const [isEditing, setIsEditing] = useState<boolean>(Boolean(draftedComment));
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [versionModalOpen, setVersionModalOpen] = useState<boolean>(false);

  const editorContainerRef = useRef<HTMLDivElement | null>(null);

  const canReview = useIsUserAuthorised('common.sample.suggestion.write');

  const deleteDraftedComment = useCallback((): void => {
    setTimeout(() => {
      const savedCommentsString = localStorage.getItem(localStorageKey);
      const savedComments = savedCommentsString ? JSON.parse(savedCommentsString) : {};
      if (draftedCommentId) {
        delete savedComments[draftedCommentId];
      }
      localStorage.setItem(localStorageKey, JSON.stringify(savedComments));
    }, 500);
    setDraftedComment(null);
  }, [draftedCommentId]);

  const handleChange = useCallback((newComment: string): void => {
    if (!isEditing) return;
    const savedCommentsString = localStorage.getItem(localStorageKey);
    const savedComments = savedCommentsString ? JSON.parse(savedCommentsString) : {};
    if (draftedCommentId) {
      const newSavedComments = {
        ...savedComments,
        [draftedCommentId]: newComment,
      };
      localStorage.setItem(localStorageKey, JSON.stringify(newSavedComments));
    }
  }, [draftedCommentId, isEditing]);

  const handleSubmit = (newComment: string, evidence?: string[], threadId?: string): void => {
    setIsEditing(false);
    deleteDraftedComment();
    setUnsavedCommentIds((prev) => prev.filter((id) => id !== draftedCommentId));
    onSubmit(newComment, evidence, threadId);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setUnsavedCommentIds((prev) => prev.filter((id) => id !== draftedCommentId));
    deleteDraftedComment();
  };

  useEffect(() => {
    if (editorContainerRef.current && draftedComment) {
      editorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsEditing(true);
    }
  }, [draftedComment, setIsEditing]);

  useEffect(() => {
    if (
      editorContainerRef.current
      && draftedCommentId
      && unsavedCommentIds.includes(draftedCommentId)
    ) {
      editorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setIsEditing(true);
    }
  }, [draftedCommentId, unsavedCommentIds]);

  return (
    <Box
      id={`report-comment-${draftedCommentId}`}
      display="flex"
      flexDirection="column"
      gap="4px"
    >
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        justifyContent={title ? 'space-between' : 'flex-end'}
      >
        {typeof title === 'string' ? (
          <CustomTypography variant="bodyRegular" fontWeight="bold">
            {title}
          </CustomTypography>
        ) : title}
        {!isGeneratingReport && !disabled && (
          <Box display="flex" gap="8px">
            {withCommentVersions
              && (comment && 'versions' in comment)
              && comment?.versions.length >= 2
              && (
                <Tooltip title="Compare to previous version">
                  <IconButton
                    onClick={(): void => setVersionModalOpen(true)}
                  >
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              )}
            {isInterpretation ? (
              <IconButton onClick={(e): void => setMenuAnchorEl(e.currentTarget)}>
                <MoreVerticalIcon />
              </IconButton>
            ) : (
              <>
                <IconButton
                  onClick={(): void => setIsEditing(true)}
                >
                  <PencilIcon />
                </IconButton>
                <IconButton
                  onClick={(): void => setDeleteModalOpen(true)}
                >
                  <Trash2Icon />
                </IconButton>
              </>
            )}
          </Box>
        )}
      </Box>
      {alterationSection}
      <EditorRoot ref={editorContainerRef}>
        {comment && draftedComment !== undefined && (
          <EditCommentInput
            comment={comment}
            draftedComment={draftedComment}
            onUpdate={handleSubmit}
            onChange={handleChange}
            onCancel={handleCancel}
            includeSaveInThread={Boolean(archive) && !isInterpretation}
            tooltipText={{
              original: 'Update the comment in all previous reports',
              duplicate: 'Update the comment in this report only',
            }}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            hideComments={Boolean(isGeneratingReport) || hideComments}
            commentMode={canReview && !disabled && !hideComments ? 'edit' : 'readOnly'}
            condensed={Boolean(isGeneratingReport)}
          />
        )}
        {!comment && !isGeneratingReport && draftedComment !== undefined && (
          <AddCommentInput
            draftComment={draftedComment}
            handleSubmit={(newComment, tag, evidence): void => handleSubmit(newComment, evidence)}
            tagOptions={[]}
            onChange={handleChange}
            onCancel={handleCancel}
            readonly={!isEditing}
          />
        )}
        {isEditing && draftedCommentId && unsavedCommentIds.includes(draftedCommentId) && (
          <ErrorMessageBox
            message="Please save or remove the comment."
            sx={{
              position: 'absolute',
              bottom: '0px',
            }}
          />
        )}
      </EditorRoot>
      {archive && !disabled && !isGeneratingReport && (
        <Box display="flex" gap="8px">
          <CustomButton
            label="Add comments from previous reports"
            variant="text"
            size="small"
            startIcon={<PlusIcon />}
            onClick={(): void => setCommentsArchiveOpen(true)}
          />
          {additionalActions}
        </Box>
      )}
      {archive && (
        <CustomModal
          open={commentsArchiveOpen}
          onClose={(): void => setCommentsArchiveOpen(false)}
          title="Add comments from archive"
          content={archive}
          showActions={{ cancel: false, confirm: false, secondary: false }}
        />
      )}
      {menuAnchorEl && (
      <CommonActionsMenu
        anchorEl={menuAnchorEl}
        onClose={(): void => setMenuAnchorEl(null)}
        actions={{
          order: false,
          edit: true,
          delete: true,
        }}
        permissions={{
          edit: !disabled,
          delete: !disabled,
        }}
        onEdit={(): void => {
          setIsEditing(true);
        }}
        onDelete={(): void => setDeleteModalOpen(true)}
      />
      )}
      {deleteModalOpen && (
        <CustomModal
          title="Delete comment"
          content={'Are you sure you want to remove this comment from this report?\nThis action cannot be undone.'}
          open={deleteModalOpen}
          onClose={(): void => setDeleteModalOpen(false)}
          variant="alert"
          buttonText={{
            cancel: 'No, don\'t delete',
            confirm: 'Yes, delete',
          }}
          onConfirm={(): void => {
            onDelete?.();
            setDeleteModalOpen(false);
          }}
        />
      )}
      {withCommentVersions
        && (comment && 'versions' in comment)
        && comment.versions.length >= 2
        && versionModalOpen
        && (
          <MTBInterpretationVersions
            open={versionModalOpen}
            onClose={(): void => setVersionModalOpen(false)}
            versions={comment.versions}
          />
        )}
    </Box>
  );
}
