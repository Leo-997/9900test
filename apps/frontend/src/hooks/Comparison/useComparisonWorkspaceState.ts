import { useState } from 'react';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import {
  comparisonSectionOptions,
  ComparisonSectionKey,
  IComparisonWorkspaceState,
} from '@/types/Comparison.types';
import { useComparisonSearch } from './useComparisonSearch';

export function useComparisonWorkspaceState(): IComparisonWorkspaceState {
  const [primarySample, setPrimarySample] = useState<IAnalysisSet | null>(null);
  const [comparisonSample, setComparisonSample] = useState<IAnalysisSet | null>(null);
  const [selectedSections, setSelectedSections] = useState<ComparisonSectionKey[]>(
    comparisonSectionOptions.map(({ key }) => key),
  );

  const primarySearch = useComparisonSearch(comparisonSample?.analysisSetId || null);
  const comparisonSearch = useComparisonSearch(primarySample?.analysisSetId || null);

  const selectPrimarySample = (sample: IAnalysisSet): void => {
    setPrimarySample(sample);
    primarySearch.clear();
  };

  const selectComparisonSample = (sample: IAnalysisSet): void => {
    setComparisonSample(sample);
    comparisonSearch.clear();
  };

  const clearPrimarySample = (): void => {
    setPrimarySample(null);
    primarySearch.clear();
  };

  const clearComparisonSample = (): void => {
    setComparisonSample(null);
    comparisonSearch.clear();
  };

  const toggleSection = (section: ComparisonSectionKey): void => {
    setSelectedSections((prev) => (
      prev.includes(section)
        ? prev.filter((item) => item !== section)
        : [...prev, section]
    ));
  };

  return {
    primarySample,
    comparisonSample,
    selectedSections,
    primarySearch,
    comparisonSearch,
    selectPrimarySample,
    selectComparisonSample,
    clearPrimarySample,
    clearComparisonSample,
    toggleSection,
  };
}
