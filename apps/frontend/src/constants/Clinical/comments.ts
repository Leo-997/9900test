import { ClinicalCommentTypes, IClinicalCommentThread } from '../../types/Comments/ClinicalComments.types';
import { ICommentTagOption } from '../../types/Comments/CommonComments.types';
import { commentTagColours, commonCommentTags, commonCommentTypes } from '../Common/comments';
import { variantTypes } from '../Common/variants';
import { reportTypes } from '../Reports/reports';

export const clinicalThreadTypes = [
  'SLIDE',
  'REPORTS',
  'SAMPLE',
] as const;

export const clinicalThreadEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'SLIDE',
  'INTERPRETATION',
  'SAMPLE',
] as const;

export const clinicalCommentTypes = [
  ...clinicalThreadTypes,
  ...commonCommentTypes,
  'GENERAL_SUMMARY',
  'CLINICAL_INFORMATION',
  'CLINICAL_INTERPRETATION',
  'RECOMMENDATIONS',
  'HTS_SUMMARY',
  'PDX_SUMMARY',
] as const;

export const defaultThread: IClinicalCommentThread = {
  id: 'new-thread-id',
  clinicalVersionId: '',
  createdAt: '',
  createdBy: '',
  type: 'REPORTS',
  entityId: null,
  entityType: null,
};

export const clinicalCommentTags: ICommentTagOption<ClinicalCommentTypes>[] = [
  ...commonCommentTags,
  {
    name: 'General Summary',
    value: 'GENERAL_SUMMARY',
    ...commentTagColours.green,
  },
  {
    name: 'Clinical Information',
    value: 'CLINICAL_INFORMATION',
    ...commentTagColours.green,
  },
  {
    name: 'HTS',
    value: 'HTS_SUMMARY',
    ...commentTagColours.green,
  },
  {
    name: 'PDX',
    value: 'PDX_SUMMARY',
    ...commentTagColours.green,
  },
];
