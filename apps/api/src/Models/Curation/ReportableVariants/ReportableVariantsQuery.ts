import { reportTypes } from 'Constants/Reports/Reports.constants';
import { VariantType, variantTypes } from 'Models/Misc/VariantType.model';
import { ReportType } from 'Models/Reports/Reports.model';
import {
  ArrayUnique, IsIn,
  IsOptional, IsString,
} from 'class-validator';

export interface IGetReportableVariantQuery {
  biosampleId?: string;
  variantType?: VariantType[];
  variantId?: string;
  reports?: ReportType[];
}
export interface IGetReportableVariantData {
  biosampleId: string;
  variantType: VariantType;
  variantId: string;
  reportType: ReportType;
  order: number | null;
}

export class ReportableVariantQueryDTO implements IGetReportableVariantQuery {
  @IsOptional()
  @IsString()
    biosampleId: string;

  @IsOptional()
  @ArrayUnique()
  @IsIn(variantTypes, { each: true })
    variantType: VariantType[];

  @IsOptional()
  @IsString()
    variantId: string;

  @IsOptional()
  @ArrayUnique()
  @IsIn(reportTypes, { each: true })
    reports: ReportType[];
}
