export const variantTypes = [
  'SNV',
  'CNV',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
  'RNA_SEQ',
  'CYTOGENETICS',
  'GERMLINE_CYTO',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'HTS',
  'HTS_COMBINATION',
  'RNA_CLASSIFIER',
] as const;

export type VariantType = typeof variantTypes[number];
