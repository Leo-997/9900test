import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getMethBiosample } from '@/utils/functions/biosamples/getMethBiosample';
import {
  buildMethylationComparisonRows,
  getMethylationComparisonCounts,
  IComparisonMethylationCounts,
  IComparisonMethylationRow,
} from './methylationComparisonUtils';

export {
  buildMethylationComparisonRows,
  getMethylationComparisonCounts,
} from './methylationComparisonUtils';
export type {
  IComparisonMethylationCounts,
  IComparisonMethylationDifference,
  IComparisonMethylationRow,
  MethylationSubgroup,
} from './methylationComparisonUtils';

interface IUseMethylationComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonMethylationRow[];
  counts: IComparisonMethylationCounts;
}

export function useMethylationComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseMethylationComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonMethylationRow[]>([]);

  useEffect(() => {
    let active = true;
    const primaryAbortController = new AbortController();
    const comparisonAbortController = new AbortController();

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      setPrimaryIssue(null);
      setComparisonIssue(null);

      try {
        const [primaryAnalysisSet, comparisonAnalysisSet] = await Promise.all([
          zeroDashSdk.curation.analysisSets.getAnalysisSetById(primaryAnalysisSetId),
          zeroDashSdk.curation.analysisSets.getAnalysisSetById(comparisonAnalysisSetId),
        ]);

        if (!active) return;

        const primaryBiosample = getMethBiosample(primaryAnalysisSet.biosamples || []);
        const comparisonBiosample = getMethBiosample(comparisonAnalysisSet.biosamples || []);

        if (!primaryBiosample) {
          setPrimaryIssue('No methylation biosample is available for the primary sample.');
        }
        if (!comparisonBiosample) {
          setComparisonIssue('No methylation biosample is available for the comparison sample.');
        }

        const [
          primaryClassifiers,
          primaryPrediction,
          comparisonClassifiers,
          comparisonPrediction,
        ] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.methylation.getMethylationData(
              primaryBiosample.biosampleId,
              { isClassified: true },
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.methylation.getMethylationPrediction(
              primaryBiosample.biosampleId,
            ).catch(() => null)
            : Promise.resolve(null),
          comparisonBiosample
            ? zeroDashSdk.methylation.getMethylationData(
              comparisonBiosample.biosampleId,
              { isClassified: true },
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.methylation.getMethylationPrediction(
              comparisonBiosample.biosampleId,
            ).catch(() => null)
            : Promise.resolve(null),
        ]);

        if (!active) return;

        setRows(buildMethylationComparisonRows({
          primaryClassifiers,
          primaryPrediction,
          comparisonClassifiers,
          comparisonPrediction,
        }));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load Methylation comparison data right now.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load().catch(() => undefined);

    return () => {
      active = false;
      primaryAbortController.abort();
      comparisonAbortController.abort();
    };
  }, [
    comparisonAnalysisSetId,
    primaryAnalysisSetId,
    zeroDashSdk.curation.analysisSets,
    zeroDashSdk.methylation,
  ]);

  const counts = useMemo<IComparisonMethylationCounts>(
    () => getMethylationComparisonCounts(rows),
    [rows],
  );

  return {
    loading,
    error,
    primaryIssue,
    comparisonIssue,
    rows,
    counts,
  };
}
