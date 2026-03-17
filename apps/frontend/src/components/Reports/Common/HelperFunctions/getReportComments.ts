import {
  CurationThreadEntityTypes, ICurationComment,
  ICurationCommentThread,
} from '../../../../types/Comments/CurationComments.types';

const getReportComments = (
  commentThreads: ICurationCommentThread[],
  entityType: CurationThreadEntityTypes,
  entityIds: string[],
  commentsFilters: (c: ICurationComment) => boolean = (): boolean => true,
  ignoreReportOrder = false,
): Record<string, ICurationComment[]> => {
  const commentsMap: Record<string, ICurationComment[]> = {};
  for (const thread of commentThreads) {
    if (
      thread.entityType === entityType
      && thread.entityId
      && entityIds.includes(thread.entityId)
    ) {
      commentsMap[thread.entityId] = thread.comments
        ?.filter(commentsFilters)
        ?.filter(
          (c) => ignoreReportOrder || Boolean(c.reportOrder),
        ) || [];
    }
  }

  return commentsMap;
};

export default getReportComments;
