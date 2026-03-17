import {
    IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString,
} from 'class-validator';
import { reportTypes } from 'Constants/Reports/Reports.constant';
import { ToBoolean } from '../../Utils/Transformers/ToBoolean.util';
import { ICommonResp } from '../Common/Response.model';
import { ReportType } from '../Reports/Reports.model';
import { } from '../Trial/Trial.model';

export interface IReportDrug {
  id: string;
  clinicalVersionId: string;
  reportType: ReportType;
  externalDrugVersionId: string;
  pbsApproved?: boolean;
  appropriateTrial?: boolean;
}

export interface IExternalDrug {
  id: string;
  internalId?: string;
  versionId: string;
  version: number;
  latestVersion: number;
  name: string;
  isValidated: boolean;
  hasPaediatricDose?: boolean;
  company?: string;
  notes?: string;
  fdaApproved?: boolean;
  artgApproved?: boolean;
  tgaApproved?: boolean;
  pathways: ICommonResp[];
  targets: ICommonResp[];
  classes: ICommonResp[];
}

export interface IDetailedReportDrug extends IReportDrug {
  externalDrug: IExternalDrug | null;
}

export type ICreateReportDrug = Omit<IReportDrug, 'id' | 'clinicalVersionId'>

export interface IDowngradeDrugVersionBody {
  drugVersionId: string;
  newDrugVersionId: string;
}

export class DowngradeClinicalDrugVersionDTO implements IDowngradeDrugVersionBody {
  @IsNotEmpty()
  @IsString()
    drugVersionId: string;

  @IsNotEmpty()
  @IsString()
    newDrugVersionId: string;
}

export interface ITherapyDrug {
  id: string,
  externalDrugClassId: string
  externalDrugVersionId: string | null,
}

export interface IFetchTherapyDrug {
  id: string;
  class: ICommonResp;
  externalDrug: IExternalDrug | null;
}

export interface IUpdateDrugBody {
  pbsApproved?: boolean;
  appropriateTrial?: boolean;
}

export interface IDrugFilters {
  reportType?: ReportType;
}

export class DrugFiltersDTO implements IDrugFilters {
  @IsOptional()
  @IsIn(reportTypes)
    reportType: ReportType;
}

export interface ICreateTherapyDrug {
  externalDrugClassId: string;
  externalDrugVersionId?: string;
}

// without alternative drugs and clinical trials
export class DrugBaseBodyDTO implements ICreateReportDrug {
  @IsIn(reportTypes)
    reportType: ReportType;

  @IsNotEmpty()
  @IsString()
    externalDrugVersionId: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    pbsApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    appropriateTrial?: boolean;
}

export class CreateTherapyDrugDTO implements ICreateTherapyDrug {
  @IsString()
    externalDrugClassId: string;

  @IsOptional()
  @IsString()
    externalDrugVersionId?: string;
}

export class UpdateDrugBodyDTO implements IUpdateDrugBody {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    pbsApproved?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    appropriateTrial?: boolean;
}
