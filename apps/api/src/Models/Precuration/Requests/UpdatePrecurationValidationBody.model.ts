import {
  IsBoolean, IsOptional, IsString, ValidateIf,
} from 'class-validator';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { RequireAtLeastOne } from 'Models/Misc/RequireAtLeastOn.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IPrecurationValidation } from '../PrecurationValidation.model';

export type IUpdatePrecurationValidation = PartialPick<
  IPrecurationValidation,
  'precurationValidated'
>;

export type IUpdatePrecurationValidationRequired = RequireAtLeastOne<
  IUpdatePrecurationValidation,
  'precurationValidated'
>;

export interface IWarningAcknowledgement {
  contaminationNote: string | null;
  statusNote: string | null;
}

export class UpdatePrecurationValidationDTO
implements IUpdatePrecurationValidation {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  precurationValidated: boolean;
}

export class UpdateAcknowledgementDTO {
  @ValidateIf((o) => o.contaminationNote !== null)
  @IsString()
  contaminationNote: string | null;

  @ValidateIf((o) => o.statusNote !== null)
  @IsString()
  statusNote: string | null;
}
