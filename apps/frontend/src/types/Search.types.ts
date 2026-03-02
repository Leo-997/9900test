import { ReactElement } from 'react';
import { ITaskDashboardFilterOptionsProps } from '@/components/TaskDashboard/SearchFilterSort/TaskDashboardFilterOptions';
import { IAnalysisPatient, IAnalysisSet } from './Analysis/AnalysisSets.types';
import { IGene, PathClass } from './Common.types';
import { IEvidenceLinkQuery, IEvidenceQuery } from './Evidence/Evidences.types';
import { FileType, Platform, ReferenceGenome } from './FileTracker/FileTracker.types';
import { ClinicalStatus } from './MTB/ClinicalStatus.types';
import { CurationStatus, SampleType } from './Samples/Sample.types';
import { IOverviewExport } from './TaskDashboard/TaskDashboard.types';

export type SortDirection = 'asc' | 'desc' | '';
export interface ISortOptions {
  sortColumns?: string[];
  sortDirections?: SortDirection[];
}

export interface ISearchBase extends ISortOptions {
  chromosome: string[];
  genename: IGene[];
  genesearchquery?: string;
  geneimportancehigh?: boolean;
  geneimportancemediumhigh?: boolean;
  geneimportancemediumlow?: boolean;
  geneimportancelow?: boolean;
}

export type FilterOption = {
  label: string,
  value: string,
  type: 'menu' | 'item',
  check?: boolean,
  submenu?: ReactElement<any>,
  setAnchor?: (e) => void,
  icon?: ReactElement<any>,
  chipLabel?: () => string,
  divider?: ReactElement<any>,
  disabled?: boolean,
  disableClearing?: boolean;
  defaultVal?: unknown;
};

export type DateRange = {
  type: 'Before' | 'After' | 'Between' | '';
  startDate?: string;
  endDate?: string;
}

export type AgeRange = {
  from: number;
  to: number;
}

export type FileSizeUnit = 'KB' | 'MB' | 'GB';

export type FileSize = {
  min: number;
  max: number;
}

export type NumberRange = {
  min: number;
  max: number;
  defaults: number[];
  unit?: string;
}

export interface IFileTrackerSearchOptions extends ISortOptions {
  searchId: string[];
  fileType: FileType[];
  sampleType: SampleType[];
  refGenome: ReferenceGenome[];
  platform: Platform[];
  fileSize: NumberRange;
}

export interface ISVSearchOptions extends ISearchBase {
  inframe: string[];
  platform: string[];
  rnaConfidence: string[];
  fusionevent: string[];
  classpath: PathClass[];
  reportable?: boolean;
}

export interface ISVGermlineSearchOptions extends ISearchBase {
  inframe: string[];
  platform: string[];
  rnaConfidence: string[];
  fusionevent: string[];
  classpath: PathClass[];
  reportable?: boolean;
}

export interface ICNVSearchOptions extends ISearchBase {
  cn?: number[];
  cnType: string[];
  cnloh?: boolean;
  classpath: PathClass[];
  reportable?: boolean;
}

export interface ICNVGermlineSearchOptions extends ISearchBase {
  cn?: number[];
  cnType: string[];
  cnloh?: boolean;
  classpath: PathClass[];
  reportable?: boolean;
}

export interface ICurationDashboardSearchOptions extends ISortOptions {
  searchId: string[];
  all: boolean;
  expedited: boolean;
  curationStatus: CurationStatus[];
  primaryCurators: string[];
  gender: string[];
  ageRange: NumberRange;
  vitalStatus: string[];
  curation: DateRange;
  enrolment: DateRange;
  study: string[];
  eventType: string[];
  cohort: string[];
  zero2Category: string[];
  zero2Subcat1: string[];
  zero2Subcat2: string[];
  zero2FinalDiagnosis: string[];
  purity: NumberRange;
  mutBurden: NumberRange;
  methClassifiers: string[];
  mgmtStatus: string[];
  meetingDate: string;

}

export interface IClinicalDashboardSearchOptions extends ISortOptions {
  searchId: string[];
  expedited: boolean;
  gender: string[];
  vitalStatus: string[];
  ageRange?: number[];
  eventType: string[];
  startMtb?: string;
  endMtb?: string;
  startEnrolment?: string;
  endEnrolment?: string;
  zero2FinalDiagnosis: string[];
  sortColumns?: string[];
  sortDirections?: SortDirection[];
  clinicalStatus: ClinicalStatus[];
  assignees: string[];
}

export interface IExportOption {
  label: string;
  selected: boolean;
  key?: keyof IAnalysisSet | keyof Omit<IAnalysisPatient, 'analysisSets'> | keyof IOverviewExport;
  transform?: (value: unknown) => string;
}

export type DashboardExportOptions = {
  patientId: IExportOption;
  sampleId: IExportOption;
  normalId: IExportOption;
  zccId?: IExportOption;
  publicSubjectId: IExportOption;
  manifestName: IExportOption;
  rnaseqId: IExportOption;
  methSampleId: IExportOption;
  htsId?: IExportOption;
  event: IExportOption;
  collection: IExportOption;
  ageAtDiagnosis: IExportOption;
  ageAtSample: IExportOption;
  ageAtDeath: IExportOption;
  vitalStatus: IExportOption;
  gender: IExportOption;
  cohort: IExportOption;
  zero2Category: IExportOption;
  zero2Subcat1: IExportOption;
  zero2Subcat2: IExportOption;
  zero2FinalDiagnosis: IExportOption;
};

export interface ISNVSearchOptions extends ISortOptions {
  chromosome: string[];
  genename: IGene[];
  genesearchquery?: string;
  classpath: PathClass[];
  consequence: string[];
  gnomad: NumberRange;
  vaf: NumberRange;
  reads: NumberRange;
  vcf?: boolean;
  biallelic?: boolean;
  loh?: boolean;
  platform: string[];
  unfiltered?: boolean;
  reportable?: boolean;
}

export interface ISNVGermlineSearchOptions extends ISortOptions {
  chromosome: string[];
  genename: IGene[];
  genesearchquery?: string;
  classpath: PathClass[];
  consequence: string[];
  gnomad: NumberRange;
  vaf: NumberRange;
  reads: NumberRange;
  vcf?: boolean;
  platform: [],
  unfiltered?: boolean;
  reportable?: boolean;
}

export interface IRNASeqSearchOptions extends ISortOptions {
  chromosome: string[];
  genename: IGene[];
  geneExpression: string[];
  genesearchquery?: string;
  foldChange: NumberRange;
  zScore: NumberRange;
  tpm: NumberRange;
  fpkm: NumberRange;
  reportable?: boolean;
}

export interface IHTSSearchOptions extends ISortOptions {
  search?: string;
  targets?: string[];
  pathways?: string[];
}

export interface IPathwaySearchOptions {
  search?: string;
}

export interface IMolecularAlterationSearchOptions {
  searchId: string[];
  zero2Category: string[];
  zero2Subcat1: string[];
  zero2Subcat2: string[];
  zero2FinalDiagnosis: string[];
  sortColumns?: string[];
  sortDirections?: SortDirection[];
}

export type SearchOptions =
  | ISVSearchOptions
  | ICNVSearchOptions
  | ICNVGermlineSearchOptions
  | ICurationDashboardSearchOptions
  | IClinicalDashboardSearchOptions
  | ISNVSearchOptions
  | ISNVGermlineSearchOptions
  | IRNASeqSearchOptions
  | IFileTrackerSearchOptions
  | IHTSSearchOptions
  | IPathwaySearchOptions
  | IEvidenceLinkQuery
  | IEvidenceQuery
  | IMolecularAlterationSearchOptions
  | ITaskDashboardFilterOptionsProps;

export type OverviewExportFields =
  | 'patientId'
  | 'sampleId'
  | 'event'
  | 'cohort'
  | 'zero2FinalDiagnosis'
  | 'curationStatus'
  | 'curationStartedAt'
  | 'curationFinalisedAt'
  | 'mtbSlidesStatus'
  | 'mtbSlidesStartedAt'
  | 'mtbSlidesFinalisedAt'
  | 'molecularReportStatus'
  | 'molecularReportStartedAt'
  | 'molecularReportApprovedAt'
  | 'germlineReportStatus'
  | 'germlineReportStartedAt'
  | 'germlineReportApprovedAt'
  | 'mtbReportStatus'
  | 'mtbReportStartedAt'
  | 'mtbReportApprovedAt'
  | 'caseStatus'
  | 'caseFinalisedAt'
  | 'notes';

export type OverviewExportOptions = Record<OverviewExportFields, IExportOption>;
