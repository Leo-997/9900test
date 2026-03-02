import { IAnalysisSet } from 'Models/Analysis/AnalysisSets.model';

/**
 * Returns true if:
 * 1. User is the primary or secondary curator
 */
export function isUserAssigned(
  userId: string,
  record: IAnalysisSet,
): boolean {
  return (
    record.primaryCuratorId === userId
    || record.secondaryCuratorId === userId
  );
}
