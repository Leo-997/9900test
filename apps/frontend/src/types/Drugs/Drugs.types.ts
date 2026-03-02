import { ReportType } from '../Reports/Reports.types';

export interface IDrugMetadata {
  id: string;
  name: string;
}

// drug properties in clinical MS
export interface IReportDrug {
  id: string;
  clinicalVersionId: string;
  reportType: ReportType;
  externalDrugVersionId: string;
  pbsApproved?: boolean | null;
  appropriateTrial?: boolean | null;
}

// drug properties drugs MS
export interface IExternalDrug {
  id: string;
  internalId?: string;
  versionId: string;
  version: number;
  latestVersion: number;
  name: string;
  isValidated: boolean;
  hasPaediatricDose?: boolean | null;
  company?: string | null;
  notes?: string;
  fdaApproved?: boolean | null;
  artgApproved?: boolean | null;
  tgaApproved?: boolean | null;
  pathways: IDrugMetadata[];
  targets: IDrugMetadata[];
  classes: IDrugMetadata[];
}

export type IEditDrug = Omit<IExternalDrug, 'id' | 'versionId' | 'version' | 'latestVersion' | 'isValidated' >

export interface ICreateDrug extends Omit<IEditDrug, 'classes' | 'pathways' | 'targets'> {
  classes: string[];
  pathways: string[];
  targets: string[];
}

export interface IUpdateDrug extends Partial<Omit<ICreateDrug, 'name'>> {
  isValidated?: boolean,
}

export interface ICreateDrugResponse {
  drugId: string;
  versionId: string;
}

export interface IUpdateDrugResponse {
  versionId: string;
  version: number;
}

export interface IDetailedReportDrug extends IReportDrug {
  externalDrug: IExternalDrug;
}

// Drug in the therapy recommendation
export interface ITherapyDrug {
  id: string;
  class: IDrugMetadata;
  externalDrugVersionId: string | null,
  externalDrug: IExternalDrug | null;
}

export interface IEditTherapyDrug {
  id: string;
  class: IDrugMetadata | null;
  drug: IExternalDrug | null;
}

export type IUpdateEditTherapyDrug = Partial<IEditTherapyDrug>

export interface IFetchReportDrugsQuery {
  reportType?: ReportType;
}

// Properties for creating a drug in the Clinical MS
export type ICreateReportDrug = Omit<IReportDrug, 'id' | 'clinicalVersionId'>;

export interface IUpdateReportDrug {
  pbsApproved?: boolean | null;
  appropriateTrial?: boolean | null;
}

// Properties for creating a therapy drug
export interface ICreateTherapyDrug {
  externalDrugClassId: string;
  externalDrugVersionId?: string;
}

// Filters for searching for drugs in the Drugs MS
export interface IDrugFilters extends Partial<Omit<IExternalDrug, 'id' | 'classes'>> {
  ids?: string[];
  classes?: string[];
  fetchAllVersions?: boolean;
}

// Filters for getting classes from the drugs MS
export interface IDrugClassFilters {
  classId?: string;
  versionId?: string;
  drugId?: string;
  drugName?: string;
  className?: string;
}

export interface IDowngradeDrugVersion {
  drugVersionId: string;
  newDrugVersionId: string;
}

// Curation therapy's drugs
export interface ICurationTherapyDrugs {
  class: IDrugMetadata;
  clinicalDrug: IExternalDrug;
}
