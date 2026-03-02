import { VariantType } from '../misc.types';

export interface IFilter {
  label: string;
  count: number;
}

export interface IFilters {
  [key: string]: IFilter;
}

export type Sections =
  | Exclude<
      VariantType,
      | 'GERMLINE_CNV'
      | 'GERMLINE_SNV'
      | 'GERMLINE_SV'
      | 'GERMLINE_CYTO'
      | 'GERMLINE_CYTO_CYTOBAND'
      | 'GERMLINE_CYTO_ARM'
      | 'CYTOGENETICS_CYTOBAND'
      | 'CYTOGENETICS_ARM'
      | 'METHYLATION_MGMT'
      | 'METHYLATION_CLASSIFIER'
      | 'RNA_CLASSIFIER'
      | 'METHYLATION_GENE'
      | 'HTS_COMBINATION'
      | 'FUSION'
      | 'DISRUPTION'
      | 'TMB'
      | 'IPASS'
    >
  | 'GERMLINE'
  | 'CURATION_MEETING'
  | 'MTB_MEETING';

export type SummaryTabs = 'SUMMARY' | 'PATIENT' | 'REPORTS';
