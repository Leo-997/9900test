import { IsIn, IsOptional, IsString } from 'class-validator';
import { evidenceEntityTypes } from 'Constants/Evidence/Evidence.constant';
import { EvidenceEntityTypes } from '../Evidence.model';

export interface IEvidenceQuery {
  evidenceIds?: string[];
  analysisSetId?: string;
  patientId?: string;
  entityIds?: string[];
  entityTypes?: EvidenceEntityTypes[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  searchQuery?: string;
}

export class EvidenceQueryDTO implements IEvidenceQuery {
  @IsOptional()
  @IsString()
    evidenceIds?: string[];

  @IsOptional()
  @IsString()
    analysisSetId?: string;

  @IsOptional()
  @IsString()
    patientId?: string;

  @IsOptional()
  @IsString({ each: true })
    entityIds?: string[];

  @IsOptional()
  @IsIn(evidenceEntityTypes, { each: true })
    entityTypes?: EvidenceEntityTypes[];

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
