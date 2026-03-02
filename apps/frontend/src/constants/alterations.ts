import { VariantType } from '../types/misc.types';

export const nonGeneAlterationTypes: readonly VariantType[] = [
  'CYTOGENETICS_ARM',
  'CYTOGENETICS_CYTOBAND',
  'METHYLATION_MGMT',
  'METHYLATION_CLASSIFIER',
  'RNA_CLASSIFIER',
  'CYTOGENETICS',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'GERMLINE_CYTO_ARM',
  'GERMLINE_CYTO_CYTOBAND',
] as const;

export const geneAlterationTypes: readonly VariantType[] = [
  'SNV',
  'CNV',
  'RNA_SEQ',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
] as const;
