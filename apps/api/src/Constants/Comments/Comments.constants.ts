import { reportCommentTypes, reportTypes } from 'Constants/Reports/Reports.constants';
import { variantTypes } from 'Models/Misc/VariantType.model';

export const threadTypes = [
  'CURATION',
  'COMMENT',
  'MOLECULAR',
  'ANALYSIS',
  'GERMLINE',
] as const;

export const threadEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'ANALYSIS',
] as const;

// Order of commentTags' items must match order in which tags are shown on ZeroDash
// (variant comments on Variant Tabs' expanded view).
// We rely on correct array items' order to sort by tag type on Comments.client (getComments).
// 'VARIANT_INTERPRETATION","GENE" & "GERMLINE_GENE"
// are tags shared by Molecular & Germline comments.
// This makes it tricky to sort germ comments by tags 100% accurately.
export const commentTags = [
  'FINAL',
  'INTRODUCTION',
  'GENE',
  'ALTERATION',
  'PREVALENCE',
  'DIAGNOSTIC',
  'PROGNOSTIC',
  'THERAPEUTIC',
  'MOLECULAR_SUMMARY',
  'ADDITIONAL_NOTES',
  'VARIANT_INTERPRETATION',
  'PHENOTYPE',
  'TUMOUR',
  'SURVEILLANCE',
  'FAMILY',
  'CLOSING',
  'GERMLINE_GENE',
] as const;

export const taskDashboardCommentTypes = ['NOTES'];

export const commentTypes = [
  ...threadTypes,
  ...commentTags,
  ...reportCommentTypes,
  ...taskDashboardCommentTypes,
] as const;
