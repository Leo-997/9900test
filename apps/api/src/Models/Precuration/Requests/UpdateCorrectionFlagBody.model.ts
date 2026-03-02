import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export type UpdateCorrectionFlagBody = {
  isCorrected?: boolean;
  correctionNote?: string;
  assignedResolver?: string;
};

export class UpdateCorrectionFlagBodyDTO implements UpdateCorrectionFlagBody {
  @IsBoolean()
  @ToBoolean()
  @IsOptional()
  isCorrected?: boolean;

  @IsString()
  @IsOptional()
  correctionNote?: string;

  @IsString()
  @IsOptional()
  assignedResolver?: string;
}
