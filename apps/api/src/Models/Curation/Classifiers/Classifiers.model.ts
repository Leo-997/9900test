import { IsOptional, IsString, IsBoolean } from 'class-validator';
import type { VariantType } from 'Models/Misc/VariantType.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export interface IClassifierVersion {
  id: string;
  type: Extract<VariantType, 'METHYLATION_CLASSIFIER' | 'RNA_CLASSIFIER'>;
  name: string;
  version: string;
  note?: string;
  showInAtlas: boolean;
}

export class ClassifierVersionFiltersDTO {
  @IsOptional()
  @IsString()
    name?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    showInAtlas?: boolean;
}

export class UpdateClassifierBodyDTO {
  @IsString()
    note: string;
}
