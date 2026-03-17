import { ClinicalInformationData } from './ClinicalInfo.types';
import { ISlideAttachment } from './MTB.types';
import { IMolecularAlterationDetail } from './MolecularAlteration.types';
import { IFetchRecommendation } from './Recommendation.types';

export type GermlineSectionType =
  | 'Molecular findings'
  | 'Interpretation'
  | 'Phenotype'
  | 'Penetrance'
  | 'Risk management'
  | 'Custom';

export interface ISlideSettings {
  recColumns?: number;
  layout?: string;
  showDescription?: string;
  noteWidth?: number;
}

export interface ICreateSlide {
  title?: string;
  slideNote?: string;
  alterations?: string[];
}

export interface ISlideSection {
  id: string;
  order: number;
  width: number;
  type: GermlineSectionType;
  slideId: string;
  name?: string;
  description?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
}

export interface ISlide {
  id: string;
  index: number;
  title: string;
  slideNote: string;
  reportNote: string;
  hidden: boolean;
  molAlterationGroupId?: string;
  alterations?: IMolecularAlterationDetail[];
  settings?: ISlideSettings;
}

export interface ISlideWithMetadata extends ISlide {
  recommendations?: IFetchRecommendation[];
  clinicalInfo?: ClinicalInformationData;
  germlineSections?: ISlideSection[];
  attachments?: ISlideAttachment[];
}

// This is to side-step blank slides not having alterations
// After a certain point, we can guarantee that the slide isn't blank
// Helps to avoid using lots of non-null assertions
export interface INonBlankSlide extends Omit<ISlide, 'alterations' | 'molAlterationGroupId'> {
  alterations: IMolecularAlterationDetail[];
  molAlterationGroupId: string;
}

export interface IUpdateSlideSetting {
  setting: string;
  value: string;
}

export interface ISlideSectionUpdate {
  name?: string;
  description?: string;
  width?: number;
}
