import { ISelectOption } from '@/types/misc.types';
import { ResourceType } from '@/types/Evidence/Resources.types';
import { reportTypes } from '../Reports/reports';
import { variantTypes } from './variants';

export const evidenceEntityTypes = [
  ...variantTypes,
  ...reportTypes,
  'THERAPY',
  'RECOMMENDATION',
  'COMMENT',
  'SLIDE',
] as const;

export const resourceInputOptions: ISelectOption<ResourceType>[] = [
  { name: 'PDF File', value: 'PDF' },
  { name: 'URL Link', value: 'LINK' },
  { name: 'Image', value: 'IMG' },
];

export const evidenceInputOptions: ISelectOption<'CITATION' | ResourceType>[] = [
  { name: 'Citation', value: 'CITATION' },
  ...resourceInputOptions,
];

export const externalCitationSources = ['PUBMED', 'PMC'] as const;
