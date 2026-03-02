import {
  germlineRecOptions, recLinksEntityTypes, recommendationTypes, recommendationViewTypes,
} from '../../constants/MTB/recommendation';
import { IActions } from '../Common.types';
import { ReportType } from '../Reports/Reports.types';
import { IMolecularAlterationDetail } from './MolecularAlteration.types';
import { ICreateTherapy, ITherapy } from '../Therapies/ClinicalTherapies.types';

export type RecommendationType = typeof recommendationTypes[number];
export type RecommendationViewType = typeof recommendationViewTypes[number];
export type GermlineRecOption = typeof germlineRecOptions[number];
export type RecLinkEntityType = typeof recLinksEntityTypes[number];

export type TierType = {
  level: string | undefined;
  class: {
    m: boolean;
    i: boolean;
    p: boolean;
  };
  noTier: boolean;
};

export interface IRecommendationLinks {
  recommendationId: string;
  clinicalVersionId: string;
  entityType: RecLinkEntityType;
  entityId: string;
  order?: number | null;
  hidden?: boolean;
}

export type RecommendationLinkEntity = Pick<IRecommendationLinks, 'entityId' | 'entityType'>

export interface IRecommendationBase {
  id: string;
  molAlterationGroupId?: string;
  targets?: string[];
  type: RecommendationType;
  title: string;
  description: string;
  clinicalVersionId: string;
  links?: IRecommendationLinks[];
}

export interface IFetchRecommendation extends Omit<IRecommendationBase, 'targets'> {
  // therapy and group common
  targets?: IMolecularAlterationDetail[];
  tier?: string;
  evidence?: string[]
  showIndividualTiers?: boolean;

  // Germline recommendation
  germlineRecOptions?: GermlineRecOption[];

  // therapy recommendation
  therapyId?: string;
  therapy?: ITherapy;

  // change of diagnosis recommendation
  clinicalDiagnosisRecommendationId?: string;
  zero2Category?: string;
  zero2Subcat1?: string;
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;

  // discussion recommendation
  recommendations?: IFetchRecommendation[];
}

export interface IFetchRecommendationFilters {
  slideId?: string;
  molAlterationGroupId?: string;
  htsAddendumId?: string;
  types?: RecommendationType[];
  reportType?: ReportType[];
  entityType?: RecLinkEntityType;
  entityId?: string;
}

export interface ICreateRecommendationLink {
  recommendationId: string;
  entityType: RecLinkEntityType;
  entityId: string;
  order?: number;
  hidden?: boolean;
}

interface ICreateRecommendationBase extends Omit<IRecommendationBase, 'links' | 'id' | 'clinicalVersionId'> {
  evidence?: string[];
  links?: Omit<ICreateRecommendationLink, 'recommendationId'>[];
}

export interface ICreateTherapyRecommendation
  extends ICreateRecommendationBase {
  therapy: ICreateTherapy;
  tier?: string;
}

export type ICreateTextRecommendation
  = ICreateRecommendationBase;

export interface ICreateGermlineRecommendation
  extends ICreateRecommendationBase {
  germlineRecOptions?: GermlineRecOption[];
}

export interface ICreateDiagnosisRecommendation
  extends ICreateRecommendationBase {
  zero2Category?: string;
  zero2Subcat1?: string;
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;
}

export interface ICreateGroupRecommendation
  extends ICreateRecommendationBase {
  recommendations: string[];
  showIndividualTiers?: boolean;
  tier?: string;
  targets?: string[];
  order?: number;
}

export type CreateRecommendation =
  | ICreateTherapyRecommendation
  | ICreateDiagnosisRecommendation
  | ICreateTextRecommendation
  | ICreateGermlineRecommendation
  | ICreateGroupRecommendation;

export interface ICreateRecFromContext {
  tier: TierType;
  selectedTargets: IMolecularAlterationDetail[];
  title: string;
  description: string;
  selectedRecs: IFetchRecommendation[];
  inReport?: boolean;
}

export interface IUpdateRecommendationBase {
  title?: string;
  description?: string;
  tier?: string | null;
  hidden?: boolean;
  molAlterationGroupId?: string | null;
  targets?: string[]
}

export type IUpdateTextRecommendation
  = IUpdateRecommendationBase;

export interface IUpdateGermlineRecommendation
  extends IUpdateRecommendationBase {
  germlineRecOptions?: GermlineRecOption[];
}

export interface IUpdateDiagnosisRecommendation
  extends IUpdateRecommendationBase {
  zero2Category?: string;
  zero2Subcat1?: string;
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;
}

export interface IUpdateTherapyRecommendation
  extends IUpdateRecommendationBase {
  tier?: string | null;
  targets?: string[];
}

export interface IUpdateRecommendation
  extends IUpdateTextRecommendation,
  IUpdateGermlineRecommendation,
  IUpdateDiagnosisRecommendation,
  IUpdateTherapyRecommendation {}

export type DiagnosisInput = {
  zero2Category?: string,
  zero2Subcat1?: string,
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;
}

export type DiagnosisOptionCombination = Required<DiagnosisInput>;

export interface IRecommendationActions extends IActions {
  duplicate?: boolean;
}
