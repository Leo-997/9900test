import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import {
  ReactNode, useCallback, useEffect, useMemo, useState, type JSX,
} from 'react';
import { CommonCommentTypes, ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { useReportData } from '@/contexts/Reports/ReportDataContext';
import { getDraftedCommentId } from '@/components/Reports/Common/HelperFunctions/getDraftedComment';
import { useReport } from '../../../../../../contexts/Reports/CurrentReportContext';
import { useZeroDashSdk } from '../../../../../../contexts/ZeroDashSdkContext';
import {
  CurationCommentTypes,
  CurationThreadEntityTypes,
  CurationThreadTypes, ICurationComment,
  ICurationCommentsQuery,
  ICurationCommentThread,
  ICurationCommentWithBody,
} from '../../../../../../types/Comments/CurationComments.types';
import { CommentsArchive } from '../../../../../ExpandedModal/Comments/CommentsArchive';
import GeneralReportComment from './GeneralReportCommentInput';

interface IProps<T extends CurationCommentTypes = CommonCommentTypes> {
  title: ReactNode;
  threadType: CurationThreadTypes;
  entityType: CurationThreadEntityTypes;
  entityId?: string;
  type: CurationCommentTypes;
  initialText?: string | null;
  removeArchive?: boolean;
  disabled?: boolean;
  // Prop for avoiding fetching a saved comment if it is a Germline Report w no findings
  // This bug will happen after saving a comment in Germline Report w Findings
  // and then making it a No Findings Report
  fetchSavedComment?: boolean;
  tagOptions?: ICommentTagOption<T>[];
}

export default function CurationReportCommentInput<
  T extends CurationCommentTypes = CommonCommentTypes
>({
  title,
  threadType,
  entityType,
  entityId,
  type,
  initialText,
  removeArchive,
  disabled,
  fetchSavedComment = true,
  tagOptions,
}: IProps<T>): JSX.Element {
  const zeroDashSdk = useZeroDashSdk();
  const { enqueueSnackbar } = useSnackbar();
  const { copyPrevReportComments } = useReport();
  const {
    reportAnalysisSet,
    curationCommentThreads,
    getCurationCommentThreads,
  } = useReportData();

  const emptyComment = useMemo<ICurationCommentWithBody | null>(() => (
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

  const [comment, setComment] = useState<ICurationCommentWithBody | null>();

  const draftedCommentId = useMemo<string>(() => getDraftedCommentId(
    `${reportAnalysisSet.analysisSetId}-${entityType}-${entityId}-${threadType}-${type}`,
    comment?.id,
  ), [comment?.id, reportAnalysisSet.analysisSetId, entityType, entityId, threadType, type]);

  const archiveDefaultFilters = useMemo<ICurationCommentsQuery>(() => ({
    threadType: [threadType],
    isHiddenInArchive: false,
    type: [type],
    entityType: [entityType],
    ...(type !== 'ADDITIONAL_NOTES' && {
      ...(reportAnalysisSet.zero2Category && {
        zero2Category: [reportAnalysisSet.zero2Category],
      }),
      ...(reportAnalysisSet.zero2Subcategory1 && {
        zero2Subcat1: [reportAnalysisSet.zero2Subcategory1],
      }),
      ...(reportAnalysisSet.zero2Subcategory2 && {
        zero2Subcat2: [reportAnalysisSet.zero2Subcategory2],
      }),
      ...(reportAnalysisSet.zero2FinalDiagnosis && {
        zero2FinalDiagnosis: [reportAnalysisSet.zero2FinalDiagnosis],
      }),
    }),
  }), [
    threadType,
    type,
    entityType,
    reportAnalysisSet.zero2FinalDiagnosis,
    reportAnalysisSet.zero2Category,
    reportAnalysisSet.zero2Subcategory1,
    reportAnalysisSet.zero2Subcategory2,
  ]);

  // comment functions and effects
  const getComment = useCallback(async (threads: ICurationCommentThread[]) => {
    if (fetchSavedComment) {
      // find comment directly attached to this report
      const reportThreads = threads
        .filter((t) => (
          t.type === threadType
          && t.entityType === entityType
          && (entityId === undefined || t.entityId === entityId)
        ))
        .sort((a, b) => dayjs(b.createdAt).diff(a.createdAt));

      const newComment = reportThreads.length && (
        reportThreads[0].comments?.find((c) => c.type === type)
      );
      if (newComment) {
        setComment({
          ...newComment,
          comment: newComment.versions?.[0]?.comment ?? '',
          thread: reportThreads[0],
        });
      } else {
        setComment(emptyComment);
      }
    } else {
      setComment(emptyComment);
    }
  }, [
    emptyComment,
    entityId,
    entityType,
    fetchSavedComment,
    threadType,
    type,
  ]);

  const handleSubmit = useCallback(async (
    newComment: string,
    evidence?: string[],
    threadId?: string,
  ): Promise<void> => {
    try {
      let newCommentId = '';
      if (!comment?.id && newComment) {
        newCommentId = await zeroDashSdk.curationComments.createComment({
          comment: newComment,
          type,
          threadType,
          entityType,
          entityId,
          analysisSetId: reportAnalysisSet.analysisSetId,
        });
      } else if (comment?.id && newComment) {
        newCommentId = await zeroDashSdk.curationComments.updateComment(
          comment.id,
          {
            comment: newComment,
          },
          threadId,
        );
      }

      if (evidence && newCommentId) {
        await zeroDashSdk.curationEvidence.updateEvidence({
          entityId: newCommentId,
          entityType: 'COMMENT',
          externalIds: evidence,
        });
      }
      getCurationCommentThreads().then(getComment);
    } catch {
      enqueueSnackbar('Could not update comment, please try again', { variant: 'error' });
    }
  }, [
    comment?.id,
    enqueueSnackbar,
    entityId,
    entityType,
    getComment,
    reportAnalysisSet.analysisSetId,
    threadType,
    type,
    zeroDashSdk.curationComments,
    zeroDashSdk.curationEvidence,
    getCurationCommentThreads,
  ]);

  const handleDelete = async (): Promise<void> => {
    if (comment?.id && comment.thread?.id) {
      await zeroDashSdk.curationComments.deleteComment(comment.id, comment.thread?.id);
      setComment(null);
      getCurationCommentThreads().then(getComment);
    }
  };

  const addFromArchive = useCallback(async (newComment: ICurationComment) => {
    if (comment?.id) {
      await zeroDashSdk.curationComments.deleteComment(comment.id, comment.thread?.id);
    }
    await zeroDashSdk.curationComments.linkCommentToThread(
      newComment.id,
      {
        threadType,
        entityType,
        entityId,
        analysisSetId: reportAnalysisSet.analysisSetId,
      },
    );
    getCurationCommentThreads().then(getComment);
    enqueueSnackbar('Updated the comment from archive.', { variant: 'success' });
  }, [
    comment?.id,
    comment?.thread?.id,
    enqueueSnackbar,
    entityId,
    entityType,
    getComment,
    getCurationCommentThreads,
    reportAnalysisSet.analysisSetId,
    threadType,
    zeroDashSdk.curationComments,
  ]);

  useEffect(() => {
    if (!copyPrevReportComments) {
      getComment(curationCommentThreads);
    }
  }, [getComment, copyPrevReportComments, curationCommentThreads]);

  return (
    <Box display="flex" flexDirection="column">
      <GeneralReportComment
        key={draftedCommentId}
        draftedCommentId={draftedCommentId}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        comment={comment ?? undefined}
        title={title}
        hideComments
        archive={!removeArchive
          && (
            <CommentsArchive
              variantType={entityType}
              variantId={entityId}
              type={threadType}
              defaultFilters={archiveDefaultFilters}
              onSelectComment={addFromArchive}
              tagOptions={tagOptions}
            />
          )}
        disabled={disabled || (!comment && !entityId)}
        withCommentVersions
      />
    </Box>
  );
}
