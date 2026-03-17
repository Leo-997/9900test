import { Dispatch, SetStateAction } from 'react';
import { IAnalysisSet } from './Analysis/AnalysisSets.types';

export const comparisonSectionOptions = [
  { key: 'summary', label: 'Sample Summary' },
  { key: 'snv', label: 'SNVs' },
  { key: 'cnv', label: 'CNVs' },
  { key: 'sv', label: 'SVs' },
  { key: 'rna', label: 'RNASeq' },
  { key: 'cytogenetics', label: 'Cytogenetics' },
  { key: 'germline', label: 'Germline' },
  { key: 'methylation', label: 'Methylation' },
] as const;

export type ComparisonSectionKey = typeof comparisonSectionOptions[number]['key'];

export interface IComparisonSampleSearchState {
  query: string;
  loading: boolean;
  results: IAnalysisSet[];
  searched: boolean;
  error: string | null;
  setQuery: Dispatch<SetStateAction<string>>;
  clear: () => void;
}

export interface IComparisonWorkspaceState {
  primarySample: IAnalysisSet | null;
  comparisonSample: IAnalysisSet | null;
  selectedSections: ComparisonSectionKey[];
  primarySearch: IComparisonSampleSearchState;
  comparisonSearch: IComparisonSampleSearchState;
  selectPrimarySample: (sample: IAnalysisSet) => void;
  selectComparisonSample: (sample: IAnalysisSet) => void;
  clearPrimarySample: () => void;
  clearComparisonSample: () => void;
  toggleSection: (section: ComparisonSectionKey) => void;
}
