import {
    IsBoolean, IsDefined, IsIn, IsOptional, IsString,
} from 'class-validator';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';

export type AddendumType = 'general' | 'hts';

export interface IAddendum {
  id: string;
  clinicalHistory: string;
  title: string;
  note: string;
  discussionTitle: string;
  discussionNote: string;
  clinicalVersionId: string;
  addendumType: AddendumType;
}

export class ICreateAddendumBodyDTO {
  @IsOptional()
  @IsString()
    title?: string;

  @IsOptional()
  @IsString()
    note?: string;

  @IsOptional()
  @IsString()
    clinicalHistory?: string;

  @IsDefined()
  @IsString()
    clinicalVersionId: string;

  @IsDefined()
  @IsIn(["general", "hts"])
    addendumType: AddendumType;
}

export class IUpdateAddendumBodyDTO {
  @IsOptional()
  @IsString()
    clinicalHistory?: string;

  @IsOptional()
  @IsString()
    title?: string;

  @IsOptional()
  @IsString()
    note?: string;

  @IsOptional()
  @IsString()
    discussionTitle?: string;

  @IsOptional()
  @IsString()
    discussionNote?: string;
}

export class IUpdatePastRecommendationBodyDTO {
  @IsDefined()
  @IsString()
    recommendationId: string;

  @IsDefined()
  @IsIn(["add", "remove"])
    mode: 'add' | 'remove';
}

export interface IHTSDrugBase {
  id: string;
  sampleId: string;
  htsId: string;
  drugId: string;
  drugName: string;
  targets: string;
  reportable: string;
  reportedAs: string;
  fileId: string;
}

export interface IHTSDrugHit {
  addendumId: string;
  drugId: string;
  description: string;
  tier: string;
}

export interface IHTSScreen {
  htsDrugId: string;
  drugId: string;
  dosePk: string;
  doseSchedule: string;
  dosePaediatric: string;
  doseTolerance: string;
  cmax_ng_ml: number;
  cmax_uM: number;
  css_ng_ml: number;
  css_uM: number;
  cssPeak: string;
  maxResponse: string;
  tumourType: string;
  crpc_uM: number;
  crpc_nM: number;
  paedCancerTrial: string;
  includeReason: string;
  notes: string;
  bloodBrainBarrier: string;
  fdaApproved: boolean;
  tgaApproved: boolean;
}

export interface IHTSDrugWithScreen extends
  IHTSDrugBase, Omit<IHTSScreen, 'htsDrugId'> {}

export interface IHTSDrug extends
  IHTSDrugBase, Omit<IHTSDrugHit, 'addendumId'> {}

export class IUpdateHTSDrugBodyDTO {
  @IsOptional()
  @IsString()
    reportedAs?: string;
}

export class IUpdateHTSDrugHitBodyDTO {
  @IsDefined()
  @ToBoolean()
  @IsBoolean()
    removeHit: boolean;

  @IsOptional()
  @IsString()
    description?: string;

  @IsOptional()
  @IsString()
    tier?: string;
}
