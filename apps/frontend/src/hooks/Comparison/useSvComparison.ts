import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import {
  buildSvComparisonRows,
  getSvComparisonCounts,
  IComparisonSvCounts,
  IComparisonSvRow,
} from './svComparisonUtils';

export {
  buildSvComparisonRows,
  getSvComparisonCounts,
} from './svComparisonUtils';
export type {
  IComparisonSvCounts,
  IComparisonSvDifference,
  IComparisonSvRow,
} from './svComparisonUtils';

interface IUseSvComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonSvRow[];
  counts: IComparisonSvCounts;
}

export function useSvComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseSvComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonSvRow[]>([]);

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

        const [primarySvs, comparisonSvs] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.sv.somatic.getReportableSVs(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.sv.somatic.getReportableSVs(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildSvComparisonRows(primarySvs, comparisonSvs));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load SV comparison data right now.');
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
    zeroDashSdk.sv.somatic,
  ]);

  const counts = useMemo<IComparisonSvCounts>(
    () => getSvComparisonCounts(rows),
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
