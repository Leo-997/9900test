import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import {
  buildCnvComparisonRows,
  getCnvComparisonCounts,
  IComparisonCnvCounts,
  IComparisonCnvRow,
} from './cnvComparisonUtils';

export {
  buildCnvComparisonRows,
  getCnvComparisonCounts,
} from './cnvComparisonUtils';
export type {
  IComparisonCnvCounts,
  IComparisonCnvDifference,
  IComparisonCnvRow,
} from './cnvComparisonUtils';

interface IUseCnvComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonCnvRow[];
  counts: IComparisonCnvCounts;
}

export function useCnvComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseCnvComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonCnvRow[]>([]);

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

        const [primaryCnvs, comparisonCnvs] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.cnv.somatic.getReportableSampleSomaticCnvs(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cnv.somatic.getReportableSampleSomaticCnvs(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildCnvComparisonRows(primaryCnvs, comparisonCnvs));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load CNV comparison data right now.');
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
    zeroDashSdk.cnv.somatic,
    zeroDashSdk.curation.analysisSets,
  ]);

  const counts = useMemo<IComparisonCnvCounts>(
    () => getCnvComparisonCounts(rows),
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
