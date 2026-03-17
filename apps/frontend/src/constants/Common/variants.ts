import { GeneVariantType, ISelectOption, VariantType } from '../../types/misc.types';

export const geneVariantTypes = [
  'SNV',
  'CNV',
  'RNA_SEQ',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
  'METHYLATION_GENE',
] as const;

export const curationVariantTypes = [
  ...geneVariantTypes,
  'RNA_CLASSIFIER',
  'METHYLATION_MGMT',
  'METHYLATION_CLASSIFIER',
  'CYTOGENETICS',
  'GERMLINE_CYTO',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'HTS',
  'HTS_COMBINATION',
] as const;

export const clinicalVariantTypes = [
  ...curationVariantTypes,
  'CYTOGENETICS_CYTOBAND',
  'CYTOGENETICS_ARM',
  'GERMLINE_CYTO_ARM',
  'GERMLINE_CYTO_CYTOBAND',
] as const;

export const reportVariantTypes = [
  ...clinicalVariantTypes,
  'BIOMATERIALS',
  'FUSION',
  'DISRUPTION',
  'GERMLINE_FUSION',
  'GERMLINE_DISRUPTION',
  'DRUG_AVAILABILITY',
] as const;

export const variantTypes = [
  ...clinicalVariantTypes,
  // for the clinical molecular findings
  'TMB',
  'IPASS',
] as const;

export const geneVariantTypeOptions: ISelectOption<GeneVariantType>[] = [
  { name: 'SNV', value: 'SNV' },
  { name: 'CNV', value: 'CNV' },
  { name: 'RNA', value: 'RNA_SEQ' },
  { name: 'SV', value: 'SV' },
  { name: 'Germline CNV', value: 'GERMLINE_CNV' },
  { name: 'Germline SNV', value: 'GERMLINE_SNV' },
  { name: 'Germline SV', value: 'GERMLINE_SV' },
  { name: 'Methylation Gene', value: 'METHYLATION_GENE' },
];

export const variantTypeOptions: ISelectOption<VariantType>[] = [
  ...geneVariantTypeOptions,
  { name: 'Cytogenetics', value: 'CYTOGENETICS' },
  { name: 'Methylation', value: 'METHYLATION' },
  { name: 'RNA Classifier', value: 'RNA_CLASSIFIER' },
  { name: 'Mutational Signature', value: 'MUTATIONAL_SIG' },
  { name: 'HTS', value: 'HTS' },
];
