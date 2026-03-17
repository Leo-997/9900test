import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean, IsIn, IsNumber, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { UpdateOrderDTO } from '../Common/Order.model';
import { PaginationDTO } from '../Common/Pagination.model';

export const nonGeneTypeAlterations = [
  'CYTOGENETICS_ARM',
  'CYTOGENETICS_CYTOBAND',
  'METHYLATION_MGMT',
  'METHYLATION_CLASSIFIER',
  'RNA_CLASSIFIER',
  'CYTOGENETICS',
  'METHYLATION',
  'MUTATIONAL_SIG',
  'HTS',
  'GERMLINE_CYTO_ARM',
  'GERMLINE_CYTO_CYTOBAND',
] as const;

export const geneTypeAlterations = [
  'SNV',
  'CNV',
  'RNA_SEQ',
  'SV',
  'GERMLINE_CNV',
  'GERMLINE_SNV',
  'GERMLINE_SV',
] as const;

export const variantTypes = [...nonGeneTypeAlterations, ...geneTypeAlterations] as const;
export type VariantType = typeof variantTypes[number];

export interface IMolecularAlterationDetail {
  id: string;
  mutationId: string;
  mutationType: VariantType;
  gene: string;
  geneId: string;
  secondaryGene: string;
  secondaryGeneId: string;
  pathway: string;
  pathwayId: string;
  alteration: string;
  curationClassification: string;
  curationTargetable: boolean;
  clinicalReportable: string;
  clinicalTargetable: boolean;
  hidden: boolean;
  frequency: string;
  prognosticFactor: boolean;
  clinicalVersionId: string;
  clinicalNotes: string;
  additionalData?: string;
  clinicalAlteration: string;
  clinicalRnaExpression: 'High' | 'Low';
  summaryOrder?: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMolecularAlterationSummary {
  id: string;
  mutationId: string;
  mutationType: VariantType;
}

export type IMolecularAlterationSummaryOptional =
  Partial<IMolecularAlterationDetail>;

export class UpdateMolecularAlterationBodyDTO
implements IMolecularAlterationSummaryOptional {
  @IsOptional()
  @IsString()
    description?: string;

  @IsOptional()
  @IsString()
    clinicalAlteration: string;

  @IsOptional()
  @IsString()
    clinicalReportable: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    clinicalTargetable: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    hidden?: boolean;

  @IsOptional()
  @IsString()
    clinicalNotes: string;

  @IsOptional()
  @IsString()
    clinicalRnaExpression: 'High' | 'Low';

  @IsOptional()
  @IsString()
    frequency?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    prognosticFactor?: boolean;
}

export interface IMolecularAlterationDetailFilter {
  searchId?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  sortColumns?: string[];
  sortDirections?: string[];
}

export class MolecularAlterationDetailsFilterDTO
  extends PaginationDTO
  implements IMolecularAlterationDetailFilter {
  @IsOptional()
  @IsString({ each: true })
    searchId?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Category?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat1?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat2?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2FinalDiagnosis?: string[];

  @IsOptional()
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @IsIn(['asc', 'desc'], { each: true })
    sortDirections?: string[];
}

export interface IMolAlterationSampleDetailsRequest extends IMolecularAlterationDetailFilter {
  currentAlteration: IMolecularAlterationSummary; // the alteration we are looking at on the FE
  alterations: IMolecularAlterationSummary[]; // The alterations we are looking for in the group
}

export class MolAlterationSummaryDTO implements IMolecularAlterationSummary {
  @IsString()
    id: string;

  @IsString()
    mutationId: string;

  @IsIn(variantTypes)
    mutationType: VariantType;
}

export class MolAlterationSampleDetailsRequestDTO
  extends MolecularAlterationDetailsFilterDTO
  implements IMolAlterationSampleDetailsRequest {
  @ValidateNested()
  @Type(() => MolAlterationSummaryDTO)
    currentAlteration: IMolecularAlterationSummary;

  @ValidateNested({ each: true })
  @ArrayNotEmpty()
  @Type(() => MolAlterationSummaryDTO)
    alterations: IMolecularAlterationSummary[];
}

export interface IMolAlterationSampleDetails {
  patientId: string;
  geneId: string;
  gene: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  pathway: string;
  additionalData: string;
  curationTargetable: boolean;
  clinicalTargetable: boolean;
  curationComment: string;
  reportComment: string;
  mutationType: VariantType;
}

export interface IMolAdditionalData {
  [key: string]: any;
}

export interface IUpdateMolAlterationSummaryOrder {
  order: UpdateOrderDTO[];
}

export class UpdateMolAlterationSummaryOrderDTO implements IUpdateMolAlterationSummaryOrder {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateOrderDTO)
    order: UpdateOrderDTO[];
}

export interface IMolAlterationQuery {
  ids?: string[];
  molAlterationGroupId?: string;
  geneIds?: number[];
  geneMutations?: string[];
  mutationIds?: string[];
  excludeMutations?: string[];
}

export class MolecularAlterationQueryDTO implements IMolAlterationQuery {
  @IsOptional()
  @IsString({ each: true })
    ids?: string[];

  @IsOptional()
  @IsString()
    molAlterationGroupId?: string;

  @IsOptional()
  @IsNumber(undefined, { each: true })
  @Type(() => Number)
    geneIds?: number[];

  @IsOptional()
  @IsString({ each: true })
    geneMutations?: string[];

  @IsOptional()
  @IsString({ each: true })
    mutationIds?: string[];

  @IsOptional()
  @IsString({ each: true })
    excludeMutations?: string[];
}

export interface ICreateMolecularAlterationsGroup {
  alterations: string[];
}

export class CreateMolecularAlterationsGroupDTO
implements ICreateMolecularAlterationsGroup {
  @IsArray()
  @IsString({ each: true })
    alterations: string[];
}
