import { useEffect, useMemo, useState } from 'react';
import { useZeroDashSdk } from '@/contexts/ZeroDashSdkContext';
import { getGermlineBiosample } from '@/utils/functions/biosamples/getGermlineBiosample';
import {
  buildGermlineComparisonRows,
  getGermlineComparisonCounts,
  IComparisonGermlineCounts,
  IComparisonGermlineRow,
} from './germlineComparisonUtils';

export {
  buildGermlineComparisonRows,
  getGermlineComparisonCounts,
} from './germlineComparisonUtils';
export type {
  GermlineSubgroup,
  IComparisonGermlineCounts,
  IComparisonGermlineDifference,
  IComparisonGermlineRow,
} from './germlineComparisonUtils';

interface IUseGermlineComparisonResult {
  loading: boolean;
  error: string | null;
  primaryIssue: string | null;
  comparisonIssue: string | null;
  rows: IComparisonGermlineRow[];
  counts: IComparisonGermlineCounts;
}

export function useGermlineComparison(
  primaryAnalysisSetId: string,
  comparisonAnalysisSetId: string,
): IUseGermlineComparisonResult {
  const zeroDashSdk = useZeroDashSdk();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryIssue, setPrimaryIssue] = useState<string | null>(null);
  const [comparisonIssue, setComparisonIssue] = useState<string | null>(null);
  const [rows, setRows] = useState<IComparisonGermlineRow[]>([]);

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

        const primaryBiosample = getGermlineBiosample(primaryAnalysisSet.biosamples || []);
        const comparisonBiosample = getGermlineBiosample(comparisonAnalysisSet.biosamples || []);

        if (!primaryBiosample) {
          setPrimaryIssue('No germline DNA biosample is available for the primary sample.');
        }
        if (!comparisonBiosample) {
          setComparisonIssue('No germline DNA biosample is available for the comparison sample.');
        }

        const [
          primarySnvs,
          primaryCnvs,
          primarySvs,
          primaryCytoArms,
          primaryCytoBands,
          comparisonSnvs,
          comparisonCnvs,
          comparisonSvs,
          comparisonCytoArms,
          comparisonCytoBands,
        ] = await Promise.all([
          primaryBiosample
            ? zeroDashSdk.snv.germline.getReportableSampleGermlineSnvs(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.cnv.germline.getAllReportableGermlineCnv(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.sv.germline.getReportableGermlineSVs(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.cytogenetics.germline.getCytogeneticsData(
              primaryBiosample.biosampleId,
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          primaryBiosample
            ? zeroDashSdk.cytogenetics.germline.getCytobands(
              primaryBiosample.biosampleId,
              { reportable: true },
              primaryAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.snv.germline.getReportableSampleGermlineSnvs(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cnv.germline.getAllReportableGermlineCnv(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.sv.germline.getReportableGermlineSVs(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cytogenetics.germline.getCytogeneticsData(
              comparisonBiosample.biosampleId,
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
          comparisonBiosample
            ? zeroDashSdk.cytogenetics.germline.getCytobands(
              comparisonBiosample.biosampleId,
              { reportable: true },
              comparisonAbortController.signal,
            )
            : Promise.resolve([]),
        ]);

        if (!active) return;

        setRows(buildGermlineComparisonRows({
          primarySnvs,
          primaryCnvs,
          primarySvs,
          primaryCytoArms,
          primaryCytoBands,
          comparisonSnvs,
          comparisonCnvs,
          comparisonSvs,
          comparisonCytoArms,
          comparisonCytoBands,
        }));
      } catch {
        if (!active) return;

        setRows([]);
        setError('Unable to load Germline comparison data right now.');
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
    zeroDashSdk.cnv.germline,
    zeroDashSdk.curation.analysisSets,
    zeroDashSdk.cytogenetics.germline,
    zeroDashSdk.snv.germline,
    zeroDashSdk.sv.germline,
  ]);

  const counts = useMemo<IComparisonGermlineCounts>(
    () => getGermlineComparisonCounts(rows),
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
