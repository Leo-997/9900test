import { Classification, ClassifierClassification } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsClassification } from 'Utilities/validators/IsClassification.util';
import { IsOptional, ValidateIf, IsBoolean } from 'class-validator';
import { IReportableVariant } from '../Common.model';

export class UpdateReportableVariantDTO<
  C extends Classification | ClassifierClassification = Classification
> implements Partial<IReportableVariant<C>> {
  @IsOptional()
  @IsClassification()
  @ValidateIf((o, v) => v !== null)
    classification?: C;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ValidateIf((o, v) => v !== null)
    targetable: boolean | null;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ValidateIf((o, v) => v !== null)
    reportable: boolean | null;
}
