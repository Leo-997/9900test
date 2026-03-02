import { IGroupedThreads, IRelatedThread } from '@/types/Comments/CommonComments.types';

export const groupThreadsBySampleId = (threads: IRelatedThread[]): IGroupedThreads[] => {
  const newThreads: IGroupedThreads[] = [];

  threads.forEach((t) => {
    const threadIndex = newThreads.findIndex((nt) => nt.analysisSetId === t.analysisSetId);

    if (threadIndex > 0) {
      newThreads[threadIndex].entityTypes.push(t.entityType);
    } else {
      newThreads.push({
        analysisSetId: t.analysisSetId,
        patientId: t.patientId,
        zero2FinalDiagnosis: t.zero2FinalDiagnosis,
        entityTypes: [t.entityType],
        interpretationReportType: t.interpretationReportType,
      });
    }
  });

  return newThreads;
};
