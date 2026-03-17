import {
  IsArray,
  IsIn, IsOptional, IsString,
} from 'class-validator';
import { evidenceEntityTypes } from 'Constants/Evidence/Evidence.constant';

export type EvidenceEntityType = typeof evidenceEntityTypes[number];

export interface IEvidence {
  // calling this evidence Id to maintain consistency with the code on FE and Curation
  evidenceId: string;
  externalId: string;
  clinicalVersionId?: string;
  entityType: EvidenceEntityType;
  entityId: string;
  createdAt: string;
  createdBy: string;
}

export interface IGetEvidence {
  externalId?: string;
  clinicalVersionId?: string;
  entityTypes?: EvidenceEntityType[];
  entityIds?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  searchQuery?: string;
}

export type ICreateEvidence = Omit<IEvidence, 'evidenceId' | 'createdAt' | 'createdBy'>;

export interface IUpdateEvidence {
  externalIds: string[];
  entityType: EvidenceEntityType;
  entityId: string;
  clinicalVersionId?: string;
}

export class GetEvidenceQueryDTO implements IGetEvidence {
  @IsOptional()
  @IsString()
    externalId?: string;

  @IsOptional()
  @IsString()
    clinicalVersionId?: string;

  @IsOptional()
  @IsIn(evidenceEntityTypes, { each: true })
    entityTypes?: EvidenceEntityType[];

  @IsOptional()
  @IsString({ each: true })
    entityIds?: string[];

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
  @IsString()
    searchQuery?: string;
}

export class CreateEvidenceDTO implements ICreateEvidence {
  @IsString()
    externalId: string;

  @IsOptional()
  @IsString()
    clinicalVersionId: string;

  @IsIn(evidenceEntityTypes)
    entityType: EvidenceEntityType;

  @IsString()
    entityId: string;
}

export class UpdateEvidenceDTO implements IUpdateEvidence {
  @IsArray()
  @IsString({ each: true })
    externalIds: string[];

  @IsIn(evidenceEntityTypes)
    entityType: EvidenceEntityType;

  @IsString()
    entityId: string;

  @IsOptional()
  @IsString()
    clinicalVersionId?: string;
}
