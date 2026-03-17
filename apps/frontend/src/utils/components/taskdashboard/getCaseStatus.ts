import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IReport } from '@/types/Reports/Reports.types';
import { CaseStatus } from '@/types/TaskDashboard/TaskDashboard.types';

export const getCaseStatus = (
  analysisSet: IAnalysisSet,
  molecularReport: IReport | null,
  germlineReport: IReport | null,
  mtbReport: IReport | null,
): CaseStatus => {
  // Case closed
  if (analysisSet.caseFinalisedAt) return 'Done';

  // Any column status "On Hold"
  if (
    [
      analysisSet.pseudoStatus,
      analysisSet.clinicalData?.pseudoStatus,
      molecularReport?.pseudoStatus,
      germlineReport?.pseudoStatus,
      mtbReport?.pseudoStatus,
    ].includes('On Hold')
  ) return 'On Hold';

  if (analysisSet.curationStatus && analysisSet.curationStatus !== 'Done') return analysisSet.curationStatus as CaseStatus;

  return 'In Progress';
};
