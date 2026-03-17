import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getRnaBiosample } from '@/utils/functions/biosamples/getRnaBiosample';
import {
  buildRnaComparisonRows,
  getRnaComparisonCounts,
  IComparisonRnaCounts,
  IComparisonRnaRow,
} from './rnaComparisonUtils';

export {
  buildRnaComparisonRows,
  getRnaComparisonCounts,
} from './rnaComparisonUtils';
export type {
  IComparisonRnaCounts,
  IComparisonRnaDifference,
  IComparisonRnaRow,
} from './rnaComparisonUtils';

interface IUseRnaComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonRnaRow[];
  counts: IComparisonRnaCounts;
}

export function useRnaComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseRnaComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonRnaRow[]>([]);

  useEffect(() => {
    let active = true;

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

        const primaryBiosample = getRnaBiosample(primaryAnalysisSet.biosamples || []);
        const comparisonBiosample = getRnaBiosample(comparisonAnalysisSet.biosamples || []);

        if (!primaryBiosample) {
          setPrimaryIssue('No RNA biosample is available for the primary sample.');
        }
        if (!comparisonBiosample) {
          setComparisonIssue('No RNA biosample is available for the comparison sample.');
        }

        const [primaryRna, comparisonRna] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.rna.getReportableRnaSeqData(primaryBiosample.biosampleId)
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.rna.getReportableRnaSeqData(comparisonBiosample.biosampleId)
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildRnaComparisonRows(primaryRna, comparisonRna));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load RNASeq comparison data right now.');
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
    zeroDashSdk.rna,
  ]);

  const counts = useMemo<IComparisonRnaCounts>(
    () => getRnaComparisonCounts(rows),
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
