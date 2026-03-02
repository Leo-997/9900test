import {
  IsBoolean,
  IsOptional,
  IsString,
} from 'class-validator';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export interface IRnaClassifierVersion {
  rnaClassifierId: string;
  name: string;
  version: string;
  note?: string;
  showInAtlas: boolean;
}

export class RnaClassifierVersionFiltersDTO {
  @IsOptional()
  @IsString()
    name?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    showInAtlas?: boolean;
}

export class UpdateRnaClassifierBodyDTO {
  @IsString()
    note: string;
}
