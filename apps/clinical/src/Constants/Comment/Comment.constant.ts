import { variantTypes } from 'Models';
import { reportTypes } from '../Reports/Reports.constant';

export const threadTypes = [
  'SLIDE',
  'REPORTS',
  'SAMPLE',
] as const;

export const threadEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'SLIDE',
  'INTERPRETATION',
  'SAMPLE',
] as const;

export const commentTags = [
  ...threadTypes,
  'GENE',
  'PATHWAY',
  'MUTATION',
  'DIAGNOSTIC',
  'PROGNOSTIC',
  'TREATMENT',
  'TARGETABILITY',
  'TRIAL',
  'PREVALENCE',
  'FINAL',
  'GENERAL_SUMMARY',
  'CLINICAL_INFORMATION',
  'GERMLINE_GENE',
  'CLINICAL_INTERPRETATION',
  'RECOMMENDATIONS',
  'PDX_SUMMARY',
  'HTS_SUMMARY',
] as const;

export const commentTypes = [
  ...threadTypes,
  ...commentTags,
] as const;
