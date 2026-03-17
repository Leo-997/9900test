import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import {
  buildCytogeneticsComparisonRows,
  getCytogeneticsComparisonCounts,
  IComparisonCytoCounts,
  IComparisonCytoRow,
} from './cytogeneticsComparisonUtils';

export {
  buildCytogeneticsComparisonRows,
  getCytogeneticsComparisonCounts,
} from './cytogeneticsComparisonUtils';
export type {
  IComparisonCytoCounts,
  IComparisonCytoDifference,
  IComparisonCytoRow,
} from './cytogeneticsComparisonUtils';

interface IUseCytogeneticsComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonCytoRow[];
  counts: IComparisonCytoCounts;
}

export function useCytogeneticsComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseCytogeneticsComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonCytoRow[]>([]);

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

        const [
          primaryArms,
          primaryCytobands,
          comparisonArms,
          comparisonCytobands,
        ] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.cytogenetics.somatic.getCytogeneticsData(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.cytogenetics.somatic.getCytobands(
              primaryBiosample.biosampleId,
              { reportable: true },
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cytogenetics.somatic.getCytogeneticsData(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cytogenetics.somatic.getCytobands(
              comparisonBiosample.biosampleId,
              { reportable: true },
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildCytogeneticsComparisonRows(
          primaryArms,
          primaryCytobands,
          comparisonArms,
          comparisonCytobands,
        ));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load Cytogenetics comparison data right now.');
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
    zeroDashSdk.cytogenetics.somatic,
  ]);

  const counts = useMemo<IComparisonCytoCounts>(
    () => getCytogeneticsComparisonCounts(rows),
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
