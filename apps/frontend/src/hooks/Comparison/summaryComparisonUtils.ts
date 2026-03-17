import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { getGermlineBiosample } from '@/utils/functions/biosamples/getGermlineBiosample';
import { getMethBiosample } from '@/utils/functions/biosamples/getMethBiosample';
import { getRnaBiosample } from '@/utils/functions/biosamples/getRnaBiosample';
import { getTumourBiosample } from '@/utils/functions/biosamples/getTumourBiosample';
import { toFixed } from '@/utils/math/toFixed';

type ComparisonStatus = 'Shared' | 'Changed';
type SummaryGroup = 'Identifiers' | 'Clinical Context' | 'Assays & QC';
type SummaryValueType = 'text' | 'availability';

export interface IComparisonSummaryRow {
  id: string;
  group: SummaryGroup;
  label: string;
  status: ComparisonStatus;
  valueType: SummaryValueType;
  primary: string;
  comparison: string;
}

export interface IComparisonSummaryCounts {
  shared: number;
  changed: number;
}

const defaultCounts: IComparisonSummaryCounts = {
  shared: 0,
  changed: 0,
};

function getDiagnosisLabel(sample: IAnalysisSet): string {
  return sample.zero2FinalDiagnosis
    || sample.histologicDiagnosis
    || sample.diagnosisEvent
    || '-';
}

function getFieldValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
}

function getPurityValue(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return `${toFixed(value, 0)}%`;
}

function getPloidyValue(value?: number | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '-';
  return toFixed(value, 2);
}

function getBooleanValue(value?: boolean | number | null): string {
  if (value === undefined || value === null) return '-';
  return value ? 'Yes' : 'No';
}

function getAssayAvailabilityValue(hasAssay: boolean): string {
  return hasAssay ? 'Available' : 'Not available';
}

function buildRow(
  id: string,
  group: SummaryGroup,
  label: string,
  primary: string,
  comparison: string,
  valueType: SummaryValueType = 'text',
): IComparisonSummaryRow {
  return {
    id,
    group,
    label,
    status: primary === comparison ? 'Shared' : 'Changed',
    valueType,
    primary,
    comparison,
  };
}

export function buildSummaryComparisonRows(
  primarySample: IAnalysisSet,
  comparisonSample: IAnalysisSet,
): IComparisonSummaryRow[] {
  const primaryTumour = getTumourBiosample(primarySample.biosamples || []);
  const comparisonTumour = getTumourBiosample(comparisonSample.biosamples || []);
  const primaryGermline = getGermlineBiosample(primarySample.biosamples || []);
  const comparisonGermline = getGermlineBiosample(comparisonSample.biosamples || []);
  const primaryRna = getRnaBiosample(primarySample.biosamples || []);
  const comparisonRna = getRnaBiosample(comparisonSample.biosamples || []);
  const primaryMeth = getMethBiosample(primarySample.biosamples || []);
  const comparisonMeth = getMethBiosample(comparisonSample.biosamples || []);

  return [
    buildRow(
      'analysis-set-id',
      'Identifiers',
      'Analysis set ID',
      getFieldValue(primarySample.analysisSetId),
      getFieldValue(comparisonSample.analysisSetId),
    ),
    buildRow(
      'patient-id',
      'Identifiers',
      'Patient ID',
      getFieldValue(primarySample.patientId),
      getFieldValue(comparisonSample.patientId),
    ),
    buildRow(
      'public-subject-id',
      'Identifiers',
      'Public subject ID',
      getFieldValue(primarySample.publicSubjectId),
      getFieldValue(comparisonSample.publicSubjectId),
    ),
    buildRow(
      'tumour-biosample',
      'Identifiers',
      'Tumour DNA biosample',
      getFieldValue(primaryTumour?.biosampleId),
      getFieldValue(comparisonTumour?.biosampleId),
    ),
    buildRow(
      'diagnosis',
      'Clinical Context',
      'Diagnosis',
      getDiagnosisLabel(primarySample),
      getDiagnosisLabel(comparisonSample),
    ),
    buildRow(
      'diagnosis-event',
      'Clinical Context',
      'Diagnosis event',
      getFieldValue(primarySample.diagnosisEvent),
      getFieldValue(comparisonSample.diagnosisEvent),
    ),
    buildRow(
      'analysis-event',
      'Clinical Context',
      'Analysis event',
      getFieldValue(primarySample.analysisEvent),
      getFieldValue(comparisonSample.analysisEvent),
    ),
    buildRow(
      'event-label',
      'Clinical Context',
      'Event label',
      getFieldValue(primarySample.c1EventNum),
      getFieldValue(comparisonSample.c1EventNum),
    ),
    buildRow(
      'study',
      'Clinical Context',
      'Study',
      getFieldValue(primarySample.study),
      getFieldValue(comparisonSample.study),
    ),
    buildRow(
      'gene-panel',
      'Clinical Context',
      'Gene panel',
      getFieldValue(primarySample.genePanel),
      getFieldValue(comparisonSample.genePanel),
    ),
    buildRow(
      'tumour-dna-availability',
      'Assays & QC',
      'Tumour DNA assay',
      getAssayAvailabilityValue(!!primaryTumour),
      getAssayAvailabilityValue(!!comparisonTumour),
      'availability',
    ),
    buildRow(
      'germline-dna-availability',
      'Assays & QC',
      'Germline DNA assay',
      getAssayAvailabilityValue(!!primaryGermline),
      getAssayAvailabilityValue(!!comparisonGermline),
      'availability',
    ),
    buildRow(
      'rna-availability',
      'Assays & QC',
      'RNA assay',
      getAssayAvailabilityValue(!!primaryRna),
      getAssayAvailabilityValue(!!comparisonRna),
      'availability',
    ),
    buildRow(
      'methylation-availability',
      'Assays & QC',
      'Methylation assay',
      getAssayAvailabilityValue(!!primaryMeth),
      getAssayAvailabilityValue(!!comparisonMeth),
      'availability',
    ),
    buildRow(
      'purity',
      'Assays & QC',
      'Purity',
      getPurityValue(primarySample.purity),
      getPurityValue(comparisonSample.purity),
    ),
    buildRow(
      'ploidy',
      'Assays & QC',
      'Ploidy',
      getPloidyValue(primarySample.ploidy),
      getPloidyValue(comparisonSample.ploidy),
    ),
    buildRow(
      'final-pass',
      'Assays & QC',
      'Final pass',
      getBooleanValue(primarySample.finalPass),
      getBooleanValue(comparisonSample.finalPass),
    ),
    buildRow(
      'failed',
      'Assays & QC',
      'Failed',
      getBooleanValue(primarySample.failed),
      getBooleanValue(comparisonSample.failed),
    ),
  ];
}

export function getSummaryComparisonCounts(
  rows: IComparisonSummaryRow[],
): IComparisonSummaryCounts {
  return rows.reduce((acc, row) => {
    if (row.status === 'Shared') acc.shared += 1;
    if (row.status === 'Changed') acc.changed += 1;
    return acc;
  }, { ...defaultCounts });
}
