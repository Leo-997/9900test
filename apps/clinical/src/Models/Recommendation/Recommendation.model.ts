import { Type } from 'class-transformer';
import {
  IsBoolean, IsIn, IsNotEmpty,
  IsNumber,
  IsOptional, IsString, ValidateIf, ValidateNested,
} from 'class-validator';
import { germlineRecOptions, recLinksEntityTypes, recommendationTypes } from 'Constants/Recommendation/Recommendation.constant';
import { reportTypes } from 'Constants/Reports/Reports.constant';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { UpdateOrderDTO } from '../Common/Order.model';
import { PaginationDTO } from '../Common/Pagination.model';
import { IMolecularAlterationDetail } from '../MolecularAlterations/MolecularAlteration.model';
import { ReportType } from '../Reports/Reports.model';
import { CreateTherapyDTO, ICreateTherapy, ITherapy } from '../Therapy/Therapy.model';

export type RecommendationType = typeof recommendationTypes[number];
export type GermlineRecOption = typeof germlineRecOptions[number];
export type RecLinkEntityType = typeof recLinksEntityTypes[number];

export interface IRecommendationTarget {
  recommendationId: string;
  alterationId: string;
}

export interface IRecommendationLinks {
  recommendationId: string;
  entityType: RecLinkEntityType;
  entityId: string;
  order?: number | null;
  hidden?: boolean;
}

export interface IRecommendationBase {
  id: string;
  clinicalVersionId: string;
  molAlterationGroupId?: string;
  targets?: string[];
  type: RecommendationType;
  title?: string;
  description?: string;
  links?: IRecommendationLinks[];
}

export interface IFetchRecommendation extends Omit<IRecommendationBase, 'targets'> {
  // Common properties
  tier?: string;
  targets?: IMolecularAlterationDetail[];
  evidence?: string[];

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

  // group recommendation
  recommendations?: IFetchRecommendation[];
  showIndividualTiers?: boolean;
}

export interface ICreateRecommendationBase extends Omit<IRecommendationBase, 'links' | 'clinicalVersionId'> {
  evidence?: string[];
  links?: Omit<IRecommendationLinks, 'recommendationId'>[]
}

export type ITextRecommendation = ICreateRecommendationBase;

export interface ITherapyRecommendation extends ICreateRecommendationBase {
  tier: string;
  therapy: ICreateTherapy;
}

export interface IGermlineRecommendation extends ICreateRecommendationBase {
  germlineRecOptions?: GermlineRecOption[];
}

export interface IDiagnosisRecommendation extends ICreateRecommendationBase {
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis?: string;
}

export interface IGroupRecommendation extends ICreateRecommendationBase {
  recommendations: string[];
  tier: string;
  showIndividualTiers: boolean;
  order?: number;
}

export interface ICreateRecommendation
  extends ITherapyRecommendation,
    ITextRecommendation,
    IGermlineRecommendation,
    IDiagnosisRecommendation,
    IGroupRecommendation {}

export interface IUpdateRecommendation {
  molAlterationGroupId?: string | null;
  targets?: string[];
  germlineRecOptions?: GermlineRecOption[];
  zero2Category?: string;
  zero2Subcat1?: string;
  zero2Subcat2?: string;
  zero2FinalDiagnosis?: string;
  title?: string;
  description?: string;
  tier?: string | null;
  hidden?: boolean;
}

export class UpdateRecommendationAlterationDTO {
  @IsIn(['add', 'remove'])
  @IsString()
    mode: 'add' | 'remove';
}

export class FetchRecommendationDTO
  extends PaginationDTO {
  @IsOptional()
  @IsString()
    slideId?: string;

  @IsOptional()
  @IsString()
    molAlterationGroupId?: string;

  @IsOptional()
  @IsString()
    htsAddendumId?: string;

  @IsOptional()
  @IsIn(recommendationTypes, { each: true })
    types?: RecommendationType[];

  @IsOptional()
  @IsIn(reportTypes, { each: true })
    reportType?: ReportType[];

  @IsOptional()
  @IsIn(recLinksEntityTypes)
    entityType?: RecLinkEntityType;

  @IsOptional()
  @IsString()
    entityId?: string;
}

export class CreateRecommendationLinkBaseDTO {
  @IsIn(recLinksEntityTypes)
    entityType: RecLinkEntityType;

  @IsString()
    entityId: string;

  @IsOptional()
  @IsNumber()
  @ValidateIf((o, v) => v !== null)
  @Type(() => Number)
    order?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    hidden?: boolean;
}

export class CreateRecommendationLinkDTO extends CreateRecommendationLinkBaseDTO {
  @IsString()
    recommendationId: string;
}

export class CreateRecommendationDTO
implements Omit<ICreateRecommendation, 'id'> {
  @IsOptional()
  @IsString()
    molAlterationGroupId?: string;

  @IsOptional()
  @IsString({ each: true })
    targets?: string[];

  @IsNotEmpty()
  @IsIn(recommendationTypes)
    type: RecommendationType;

  @IsOptional()
  @IsString()
    title?: string;

  @IsOptional()
  @IsString()
    description?: string;

  @ValidateIf((o) => o.type === 'THERAPY' || o.type === 'GROUP')
  @IsOptional()
  @IsString()
    tier: string;

  @ValidateIf((o) => o.type === 'GROUP')
  @IsOptional()
  @IsBoolean()
    showIndividualTiers: boolean;

  @ValidateIf((o) => o.type === 'THERAPY')
  @ValidateNested()
  @Type(() => CreateTherapyDTO)
    therapy: ICreateTherapy;

  @ValidateIf((o) => o.type === 'GERMLINE')
  @IsOptional()
  @IsIn(germlineRecOptions, { each: true })
    germlineRecOptions?: GermlineRecOption[];

  @ValidateIf((o) => o.type === 'CHANGE_DIAGNOSIS')
  @IsString()
  @IsNotEmpty()
    zero2Category: string;

  @ValidateIf((o) => o.type === 'CHANGE_DIAGNOSIS')
  @IsString()
  @IsNotEmpty()
    zero2Subcat1: string;

  @ValidateIf((o) => o.type === 'CHANGE_DIAGNOSIS')
  @IsString()
  @IsNotEmpty()
    zero2Subcat2: string;

  @ValidateIf((o) => o.type === 'CHANGE_DIAGNOSIS')
  @IsOptional()
  @IsString()
    zero2FinalDiagnosis: string;

  @ValidateIf((o) => o.type === 'GROUP')
  @IsString({ each: true })
    recommendations: string[];

  @IsOptional()
  @IsString({ each: true })
    evidence?: string[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRecommendationLinkBaseDTO)
    links?: CreateRecommendationLinkBaseDTO[];
}

export class UpdateRecommendationDTO
implements IUpdateRecommendation {
  @IsOptional()
  @IsString()
  @ValidateIf((o, v) => v !== null)
    molAlterationGroupId?: string | null;

  @IsOptional()
  @IsString({ each: true })
    targets?: string[];

  @IsOptional()
  @IsIn(germlineRecOptions, { each: true })
    germlineRecOptions?: GermlineRecOption[];

  @IsOptional()
  @IsString()
    title?: string;

  @IsOptional()
  @IsString()
    description?: string;

  @IsOptional()
  @IsString()
    zero2Category?: string;

  @IsOptional()
  @IsString()
    zero2Subcat1?: string;

  @IsOptional()
  @IsString()
    zero2Subcat2?: string;

  @IsOptional()
  @IsString()
    zero2FinalDiagnosis?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o, v) => v !== null)
    tier?: string | null;

  @IsOptional()
  @IsString({ each: true })
    evidence?: string[];
}

export class UpdateRecommendationOrderDTO {
  @IsIn(recLinksEntityTypes)
    entityType: RecLinkEntityType;

  @IsString()
    entityId: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDTO)
    order: UpdateOrderDTO[];
}
