import { VariantType } from '../misc.types';
import { ReportType } from './Reports.types';

export interface IGetReportableVariantQuery {
  variantType?: VariantType[];
  variantId?: string;
  reports?: ReportType[];
}

export interface IGetReportableVariantData {
  variantType: VariantType;
  variantId: string;
  reportType: ReportType;
  order: number | null;
}

export interface IUpdateReportableVariantBody {
  variantType: VariantType;
  variantId: string;
  reports: ReportType[];
}

export interface IUpdateReportableVariantOrder {
  variantType: VariantType;
  variantId: string;
  reportType: ReportType;
}
