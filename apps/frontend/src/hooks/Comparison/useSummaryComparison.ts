import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import {
  buildSummaryComparisonRows,
  getSummaryComparisonCounts,
  IComparisonSummaryCounts,
  IComparisonSummaryRow,
} from './summaryComparisonUtils';

export {
  buildSummaryComparisonRows,
  getSummaryComparisonCounts,
} from './summaryComparisonUtils';
export type {
  IComparisonSummaryCounts,
  IComparisonSummaryRow,
} from './summaryComparisonUtils';

interface IUseSummaryComparisonResult {
  loading: boolean;
  error: string | null;
  rows: IComparisonSummaryRow[];
  counts: IComparisonSummaryCounts;
}

export function useSummaryComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseSummaryComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonSummaryRow[]>([]);

  useEffect(() => {
    let active = true;

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        const [primarySample, comparisonSample] = await Promise.all([
          zeroDashSdk.curation.analysisSets.getAnalysisSetById(primaryAnalysisSetId),
          zeroDashSdk.curation.analysisSets.getAnalysisSetById(comparisonAnalysisSetId),
        ]);

        if (!active) return;

        setRows(buildSummaryComparisonRows(primarySample, comparisonSample));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load sample summary comparison data right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load().catch(() => undefined);

    return () => {
      active = false;
    };
  }, [
    comparisonAnalysisSetId,
    primaryAnalysisSetId,
    zeroDashSdk.curation.analysisSets,
  ]);

  const counts = useMemo<IComparisonSummaryCounts>(
    () => getSummaryComparisonCounts(rows),
    [rows],
  );

  return {
    loading,
    error,
    rows,
    counts,
  };
}
