import {
  IsArray, IsIn, IsOptional, IsString,
} from 'class-validator';
import { evidenceEntityTypes } from 'Constants/Evidence/Evidence.constant';
import { EvidenceEntityTypes, IUpdateEvidence } from '../Evidence.model';

export class UpdateEvidenceDTO implements IUpdateEvidence {
  @IsArray()
  @IsString({ each: true })
    externalIds: string[];

  @IsIn(evidenceEntityTypes)
    entityType: EvidenceEntityTypes;

  @IsString()
    entityId: string;

  @IsOptional()
  @IsString()
    analysisSetId?: string;

  @IsOptional()
  @IsString()
    biosampleId?: string;
}
