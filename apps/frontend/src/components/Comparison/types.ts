import type { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';

export type ComparisonMode =
  | 'SinglePatientReport'
  | 'SamePatientTimepointComparison'
  | 'MultiPatientComparison';

export interface ComparisonSubject {
  id: string; // local uuid
  patientId: string;
  analysisSetId: string;
  timepointTag: string; // Diagnosis / Relapse / Progression / etc (manual for v1)
  analysisSet?: IAnalysisSet;
}

export interface MetricDefinition {
  id: string;
  label: string;
  getValue: (subject: ComparisonSubject) => string;
}

