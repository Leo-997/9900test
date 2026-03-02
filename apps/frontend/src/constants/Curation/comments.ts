import { ICommentTagOption } from '@/types/Comments/CommonComments.types';
import { CurationThreadTypes, GermlineCommentTypes, MolecularCommentTypes } from '../../types/Comments/CurationComments.types';
import { ISelectOption, ISortMenuOption } from '../../types/misc.types';
import { commentTagColours, commonCommentTags, commonCommentTypes } from '../Common/comments';
import { variantTypeOptions, variantTypes } from '../Common/variants';
import { reportTypes } from '../Reports/reports';

export const curationThreadTypes = [
  'CURATION',
  'COMMENT',
  'MOLECULAR',
  'ANALYSIS',
  'GERMLINE',
] as const;

export const curationThreadEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'ANALYSIS',
] as const;

export const molecularCommentTypes = [
  ...commonCommentTypes,
  'VARIANT_INTERPRETATION',
  'MOLECULAR_SUMMARY',
  'GERMLINE_SNV_NO_FINDINGS',
  'ADDITIONAL_NOTES',
  'HTS_SUMMARY',
] as const;

export const germlineCommentTypes = [
  'VARIANT_INTERPRETATION',
  'INTRODUCTION',
  'GENE',
  'PHENOTYPE',
  'TUMOUR',
  'SURVEILLANCE',
  'FAMILY',
  'CLOSING',
  'GERMLINE_GENE',
  'CLINICAL_NOTES',
  'CLINICAL_INTERPRETATIONS',
  'RECOMMENDATIONS',
] as const;

export const taskDashboardCommentTypes = [
  'NOTES',
] as const;

// All types that can be sent to the curation API
export const curationCommentTypes = [
  ...curationThreadTypes,
  ...molecularCommentTypes,
  ...germlineCommentTypes,
  ...taskDashboardCommentTypes,
] as const;

export const curationCommentTabs: ISelectOption<CurationThreadTypes>[] = [
  { name: 'Curation', value: 'CURATION' },
  { name: 'Comment', value: 'COMMENT' },
  { name: 'Molecular', value: 'MOLECULAR' },
  { name: 'Germline', value: 'GERMLINE' },
];

export const commentsSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Created At: Newest to oldest',
    value: 'Original Created At:desc',
  },
  {
    name: 'Created At: Oldest to newest',
    value: 'Original Created At:asc',
  },
];

export const curationThreadEntityOptions = [
  ...variantTypeOptions,
  { name: 'Germline Report', value: 'GERMLINE_REPORT' },
] as const;

export const variantInterpretationTag = {
  name: 'Variant Interpretation',
  value: 'VARIANT_INTERPRETATION',
  ...commentTagColours.blue,
} as const;

// Tags that appear on the molecular tab
export const molecularCommentTags: ICommentTagOption<MolecularCommentTypes>[] = [
  ...commonCommentTags,
  variantInterpretationTag,
];

// Tags that appear on the germline tab
export const germlineCommentTags: ICommentTagOption<GermlineCommentTypes>[] = [
  {
    name: 'Introduction',
    value: 'INTRODUCTION',
    ...commentTagColours.orange,
  },
  {
    name: 'Gene Description',
    value: 'GENE',
    ...commentTagColours.blue,
  },
  {
    name: 'Phenotype',
    value: 'PHENOTYPE',
    ...commentTagColours.blue,
  },
  {
    name: 'Tumour Features',
    value: 'TUMOUR',
    ...commentTagColours.blue,
  },
  {
    name: 'Surveillance',
    value: 'SURVEILLANCE',
    ...commentTagColours.violet,
  },
  {
    name: 'Family planning',
    value: 'FAMILY',
    ...commentTagColours.violet,
  },
  {
    name: 'Closing statement',
    value: 'CLOSING',
    ...commentTagColours.orange,
  },
  {
    name: 'Germline Gene Comment',
    value: 'GERMLINE_GENE',
    ...commentTagColours.blue,
  },
];

export const snvCurationTemplate = '{"value":[{"id":"1","type":"p","children":[{"text":"[Gene description]"}]},{"id":"lqMZEDbijt","type":"p","children":[{"text":""}]},{"id":"1ATQrcWKbb","type":"p","children":[{"text":"[Variant type] variant in exon X/X (X123Y). Seen in X alleles in Gnomad exomes (pop freq = %). Clinvar classifies as X (X subs, X stars). Mostly X in silico tools (X vs X). Seen Xx in PeCan. Seen Xx in COSMIC. Situated in X domain (in a hotspot/not in a hotspot). Alternate variants X are X in Clinvar."}]}],"comments":{}}';
