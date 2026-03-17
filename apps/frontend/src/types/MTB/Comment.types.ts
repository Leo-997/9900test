import { staticSlides } from '../../constants/Clinical/slide';

export const entityTypes = [
  ...staticSlides,
  'SLIDE',
  'SAMPLE',
] as const;
export type EntityType = typeof entityTypes[number];

export interface ICommentURL {
  slideIndex: string;
}

export interface ICreateClinicalCommentBody {
  comment: string;
  entityType: EntityType;
  entityId?: string;
}

export interface IUpdateClinicalCommentBody {
  isHidden?: boolean;
  isResolved?: boolean;
}
