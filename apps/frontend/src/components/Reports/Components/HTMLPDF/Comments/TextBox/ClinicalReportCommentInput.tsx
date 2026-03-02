import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  ReactNode, useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import ClinicalCommentArchive from '@/components/MTB/Comment/ClinicalCommentArchive';
import { getDraftedCommentId } from '@/components/Reports/Common/HelperFunctions/getDraftedComment';
import { useClinical } from '@/contexts/ClinicalContext';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { useUser } from '@/contexts/UserContext';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import {
  ClinicalCommentTypes,
  ClinicalThreadEntityTypes,
  ClinicalThreadTypes,
  IClinicalComment,
  IClinicalCommentsQuery,
  IClinicalCommentThread,
  IClinicalCommentWithBody,
} from '@/types/Comments/ClinicalComments.types';
import GeneralReportComment from './GeneralReportCommentInput';

interface IProps {
  title?: ReactNode;
  threadType: ClinicalThreadTypes;
  entityType: ClinicalThreadEntityTypes;
  entityId?: string;
  type: ClinicalCommentTypes;
  initialText?: string | null;
  removeArchive?: boolean;
  disabled?: boolean;
  fetchSavedComment?: boolean;
}

export default function ClinicalReportCommentInput({
  title,
  threadType,
  entityType,
  entityId,
  type,
  initialText,
  removeArchive,
  disabled,
  fetchSavedComment = true,
}: IProps): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { currentUser } = useUser();
  const { enqueueSnackbar } = useSnackbar();
  const { clinicalVersion } = useClinical();
  const {
    clinicalCommentThreads,
    getClinicalCommentThreads,
  } = useReportData();

  const emptyComment = useMemo<IClinicalCommentWithBody | null>(() => (
    initialText
      ? {
        id: '',
        comment: initialText,
        type,
        originalThreadType: threadType,
        isHiddenInArchive: true,
        originalCreatedAt: '',
        originalCreatedBy: '',
        versions: [],
      } : null
  ), [initialText, type, threadType]);

  const [comment, setComment] = useState<IClinicalCommentWithBody | null>();

  const draftedCommentId = useMemo<string>(() => getDraftedCommentId(
    `${clinicalVersion.id}-${entityType}-${entityId}-${threadType}-${type}`,
    comment?.id,
  ), [comment?.id, clinicalVersion.id, entityType, entityId, threadType, type]);

  const archiveDefaultFilters = useMemo<IClinicalCommentsQuery>(() => ({
    threadType: [threadType],
    isHiddenInArchive: false,
    type: [type],
    entityType: [entityType],
  }), [threadType, type, entityType]);

  const getComment = useCallback(async (threads: IClinicalCommentThread[]) => {
    if (fetchSavedComment) {
      // get the default comment
      const reportThreads = threads
        .filter((t) => (
          t.type === threadType
          && t.entityType === entityType
          && (entityId === undefined || t.entityId === entityId)
        ))
        .sort((a, b) => dayjs(b.createdAt).diff(a.createdAt));

      const fetchedComment = reportThreads.length && (
        reportThreads[0].comments?.find((c) => c.type === type)
      );
      if (fetchedComment) {
        setComment({
          ...fetchedComment,
          comment: fetchedComment.versions?.[0]?.comment ?? '',
          thread: reportThreads[0],
        });
      } else {
        setComment(emptyComment);
      }
    } else {
      setComment(emptyComment);
    }
  }, [
    entityId,
    entityType,
    threadType,
    type,
    emptyComment,
    fetchSavedComment,
  ]);

  const handleSubmit = useCallback(async (
    newComment: string,
    citations?: string[],
  ): Promise<void> => {
    try {
      let newCommentId = '';
      // The comment does not exist so we need to create a new one
      if (!comment || !comment.id) {
        newCommentId = await zeroDashSdk.mtb.comment.createComment({
          comment: newComment,
          type,
          thread: {
            clinicalVersionId: clinicalVersion.id,
            threadType,
            entityType,
            entityId,
          },
        });
      // Summary does exist, and a new comment also exists (text box is not empty)
      // So just update the existing comment
      } else if (comment && newComment) {
        newCommentId = comment.id;
        const latestVersion = comment.versions[0];
        if (latestVersion?.createdBy === currentUser?.id) {
          await zeroDashSdk.mtb.comment.updateCommentVersion(
            newCommentId,
            latestVersion.id,
            { comment: newComment },
          );
        } else {
          await zeroDashSdk.mtb.comment.createCommentVersion(
            comment.id,
            {
              comment: newComment,
            },
          );
        }
      }

      // Check if there are citations as part of this new update and update db accordingly
      if (citations && newCommentId) {
        await zeroDashSdk.mtb.evidence.updateEvidence({
          entityId: newCommentId,
          entityType: 'COMMENT',
          externalIds: citations,
        });
      }
      getClinicalCommentThreads().then(getComment);
    } catch {
      enqueueSnackbar('Could not update the clinical information comment, please try again', { variant: 'error' });
    }
  }, [
    currentUser?.id,
    clinicalVersion.id,
    comment,
    enqueueSnackbar,
    entityId,
    entityType,
    threadType,
    type,
    zeroDashSdk.mtb.comment,
    zeroDashSdk.mtb.evidence,
    getComment,
    getClinicalCommentThreads,
  ]);

  const handleDelete = async (): Promise<void> => {
    if (comment?.id && comment.thread?.id) {
      await zeroDashSdk.mtb.comment.deleteComment(
        comment.id,
        comment.thread?.id,
      );
      setComment(null);
      getClinicalCommentThreads().then(getComment);
    }
  };

  const addFromArchive = useCallback(async (newComment: IClinicalComment) => {
    if (comment?.id) {
      await zeroDashSdk.mtb.comment.deleteComment(
        comment.id,
        comment.thread?.id,
      );
      await zeroDashSdk.mtb.comment.linkCommentToThread(
        newComment.id,
        {
          threadType,
          entityType,
          entityId,
          clinicalVersionId: clinicalVersion.id,
        },
      );
      getClinicalCommentThreads().then(getComment);
      enqueueSnackbar('Updated the comment from archive.', { variant: 'success' });
    }
  }, [
    clinicalVersion.id,
    comment?.id,
    comment?.thread?.id,
    enqueueSnackbar,
    entityId,
    entityType,
    getClinicalCommentThreads,
    getComment,
    threadType,
    zeroDashSdk.mtb.comment,
  ]);

  useEffect(() => {
    getComment(clinicalCommentThreads);
  }, [getComment, clinicalCommentThreads]);

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <GeneralReportComment
        key={draftedCommentId}
        draftedCommentId={draftedCommentId}
        title={title}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        comment={comment ?? undefined}
        disabled={disabled}
        withCommentVersions
        archive={
          !removeArchive
            && (
              <ClinicalCommentArchive
                selectedComments={[]}
                onSelectClick={addFromArchive}
                defaultFilters={archiveDefaultFilters}
              />
            )
        }
      />
    </Box>
  );
}
