import {
  IsDefined, IsIn, IsOptional, IsString,
} from 'class-validator';
import { evidenceEntityTypes } from 'Constants/Evidence/Evidence.constant';
import { EvidenceEntityTypes, ICreateEvidence } from '../Evidence.model';

export class CreateEvidenceDTO implements ICreateEvidence {
  @IsDefined()
  @IsString()
    externalId: string;

  @IsOptional()
  @IsString()
    entityId?: string;

  @IsOptional()
  @IsIn(evidenceEntityTypes)
    entityType?: EvidenceEntityTypes;

  @IsOptional()
  @IsString()
    analysisSetId?: string;

  @IsOptional()
  @IsString()
    biosampleId?: string;
}
