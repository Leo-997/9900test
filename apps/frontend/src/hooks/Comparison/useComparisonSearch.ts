import { useEffect, useRef, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { IComparisonSampleSearchState } from '@/types/Comparison.types';

const SEARCH_LIMIT = 8;
const SEARCH_DEBOUNCE_MS = 300;

export function useComparisonSearch(
  excludedAnalysisSetId: string | null,
): IComparisonSampleSearchState {
  const zeroDashSdk = useZeroDashSdk();

  const requestIdRef = useRef<number>(0);

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<IAnalysisSet[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      requestIdRef.current += 1;
      setLoading(false);
      setResults([]);
      setSearched(false);
      setError(null);
      return undefined;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const runSearch = async (): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const response = await zeroDashSdk.curation.analysisSets.getAnalysisSets(
          { search: [trimmedQuery] },
          1,
          SEARCH_LIMIT,
        );

        if (requestId !== requestIdRef.current) return;

        const deduplicated = response.filter((sample, index, arr) => (
          arr.findIndex((value) => value.analysisSetId === sample.analysisSetId) === index
        ));

        setResults(deduplicated.filter(
          (sample) => sample.analysisSetId !== excludedAnalysisSetId,
        ));
        setSearched(true);
      } catch {
        if (requestId !== requestIdRef.current) return;

        setResults([]);
        setSearched(true);
        setError('Unable to search samples right now.');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      runSearch().catch(() => undefined);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [excludedAnalysisSetId, query, zeroDashSdk.curation.analysisSets]);

  const clear = (): void => {
    requestIdRef.current += 1;
    setQuery('');
    setLoading(false);
    setResults([]);
    setSearched(false);
    setError(null);
  };

  return {
    query,
    loading,
    results,
    searched,
    error,
    setQuery,
    clear,
  };
}
