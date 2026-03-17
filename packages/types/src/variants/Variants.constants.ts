// For the separate tables on the reports
export const pseudoVariantTypes = [
  'BIOMATERIALS',
  'FUSION',
  'DISRUPTION',
  'GERMLINE_FUSION',
  'GERMLINE_DISRUPTION',
  'DRUG_AVAILABILITY',
] as const;

export const variantTypes = [
  ...pseudoVariantTypes,
  'SNV',
  'CNV',
  'RNA_SEQ',
  'CYTOGENETICS',
  'GERMLINE_CYTO',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'HTS',
  'HTS_COMBINATION',
] as const;

export type VariantType = typeof variantTypes[number];
