import {
  ArrayUnique, IsIn, IsNotEmpty,
  IsString,
} from 'class-validator';
import { reportTypes } from 'Constants/Reports/Reports.constants';
import { VariantType, variantTypes } from 'Models/Misc/VariantType.model';
import { ReportType } from 'Models/Reports/Reports.model';

export interface IUpdateReportableVariantBody {
  variantType: VariantType;
  variantId: string;
  reports: ReportType[];
}

export class ReportableVariantBodyDTO implements IUpdateReportableVariantBody {
  @IsNotEmpty()
  @IsIn(variantTypes)
    variantType: VariantType;

  @IsNotEmpty()
  @IsString()
    variantId: string;

  @ArrayUnique()
  @IsIn(reportTypes, { each: true })
    reports: ReportType[];
}
