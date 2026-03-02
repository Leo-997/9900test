import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsOptional, IsBoolean } from 'class-validator';
import { IReportableVariant } from '../Common.model';

export interface IGetReportableVariant extends Omit<Partial<IReportableVariant>, 'classification'> {
  isClassified?: boolean;
}

export class GetReportableVariantDTO implements IGetReportableVariant {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isClassified?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  targetable?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  reportable?: boolean;
}
