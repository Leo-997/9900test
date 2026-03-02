import {
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { curationAtlasNotesEntityTypes } from './CurationAtlas.constants';

export type CurationAtlasNotesEntityType = typeof curationAtlasNotesEntityTypes[number];

export class CurationAtlasNote {
  id: string;

  entityType: CurationAtlasNotesEntityType;

  version: string | null;

  notes: string | null;
}

export class GetCurationAtlasNotesFilterDTO {
  @IsOptional()
  @IsIn(curationAtlasNotesEntityTypes)
    entityType: CurationAtlasNotesEntityType;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
    version?: string | null;
}

export class UpdateCurationAtlasNoteDTO {
  @IsIn(curationAtlasNotesEntityTypes)
    entityType: CurationAtlasNotesEntityType;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
    version?: string | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsString()
    notes: string | null;
}
