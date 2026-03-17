import { ICommentTagOption } from '../../types/Comments/CommonComments.types';

export const commonCommentTypes = [
  'GENE',
  'ALTERATION',
  'DIAGNOSTIC',
  'PROGNOSTIC',
  'THERAPEUTIC',
  'PREVALENCE',
  'FINAL',
  'GERMLINE_GENE',
] as const;

export const commentTagColours = {
  /**
   * ###### IMPORTANT ######
   * The color values must be in hex to support adding alpha value in
   * src/components/ExpandedModal/Comments/Input/AddCommentInput.tsx
   */
  green: {
    color: '#015831',
    backgroundColor: '#D1FCE6',
  },
  blue: {
    color: '#006FED',
    backgroundColor: '#D7EAFC',
  },
  violet: {
    color: '#6F60E5',
    backgroundColor: '#E1DEFC',
  },
  orange: {
    color: '#BC4A09',
    backgroundColor: '#FFF2E6',
  },
};

export const commonCommentTags: ICommentTagOption[] = [
  {
    name: 'Final comment',
    value: 'FINAL',
    ...commentTagColours.green,
  },
  {
    name: 'Gene Description',
    value: 'GENE',
    ...commentTagColours.blue,
  },
  {
    name: 'Alteration Description',
    value: 'ALTERATION',
    ...commentTagColours.blue,
  },
  {
    name: 'Prevalence Description',
    value: 'PREVALENCE',
    ...commentTagColours.blue,
  },
  {
    name: 'Diagnostic Comment',
    value: 'DIAGNOSTIC',
    ...commentTagColours.violet,
  },
  {
    name: 'Prognostic Comment',
    value: 'PROGNOSTIC',
    ...commentTagColours.violet,
  },
  {
    name: 'Therapeutic Comment',
    value: 'THERAPEUTIC',
    ...commentTagColours.orange,
  },
  {
    name: 'Germline Gene Comment',
    value: 'GERMLINE_GENE',
    ...commentTagColours.blue,
  },
];
