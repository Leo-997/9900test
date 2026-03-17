import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import {
  buildSnvComparisonRows,
  getSnvComparisonCounts,
  IComparisonSnvCounts,
  IComparisonSnvRow,
} from './snvComparisonUtils';

export {
  buildSnvComparisonRows,
  getSnvComparisonCounts,
} from './snvComparisonUtils';
export type {
  IComparisonSnvCounts,
  IComparisonSnvDifference,
  IComparisonSnvRow,
} from './snvComparisonUtils';

interface IUseSnvComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonSnvRow[];
  counts: IComparisonSnvCounts;
}

export function useSnvComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseSnvComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonSnvRow[]>([]);

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

        const primaryBiosample = getTumourBiosample(primaryAnalysisSet.biosamples || []);
        const comparisonBiosample = getTumourBiosample(comparisonAnalysisSet.biosamples || []);

        if (!primaryBiosample) {
          setPrimaryIssue('No tumour DNA biosample is available for the primary sample.');
        }
        if (!comparisonBiosample) {
          setComparisonIssue('No tumour DNA biosample is available for the comparison sample.');
        }

        const [primarySnvs, comparisonSnvs] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.snv.somatic.getReportableSampleSomaticSnvs(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.snv.somatic.getReportableSampleSomaticSnvs(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildSnvComparisonRows(primarySnvs, comparisonSnvs));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load SNV comparison data right now.');
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
    zeroDashSdk.snv.somatic,
  ]);

  const counts = useMemo<IComparisonSnvCounts>(
    () => getSnvComparisonCounts(rows),
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
