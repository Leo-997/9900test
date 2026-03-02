import { reportVariantTypes } from '@/constants/Common/variants';
import {
  germlineReportAttachmentOptions, reportGenerationType, reportMetadataKeys, reportTypes,
} from '../../constants/Reports/reports';
import { Group } from '../Auth/Group.types';
import { ISortOptions } from '../Search.types';
import { PseudoStatus } from '../TaskDashboard/TaskDashboard.types';
import { ApprovalStatus, IApproval, Label } from './Approvals.types';

export type GermlineReportAttachmentOptions = typeof germlineReportAttachmentOptions[number];

export type ReportVariantType = typeof reportVariantTypes[number];
export type ReportType = typeof reportTypes[number];
export type ReportGenerationType = typeof reportGenerationType[number];
export type ReportMetadataKey = typeof reportMetadataKeys[number];

export type ReportMetadata = Partial<Record<ReportMetadataKey, string>>;

export interface IReport {
  id: string;
  analysisSetId: string;
  type: ReportType;
  status: ApprovalStatus;
  pseudoStatus: PseudoStatus | null;
  approvedAt: string | null;
  fileId?: string | null;
  approvals?: IApproval[];
  metadata?: ReportMetadata;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
}

export interface ITaskDashboardReport extends IReport {
  startedAt?: string | null;
}

export interface IGetReportsQuery extends ISortOptions {
  analysisSetIds?: string[];
  types?: ReportType[];
  approvers?: string[];
  statuses?: ApprovalStatus[];
  pseudoStatuses?: PseudoStatus[];
  fileId?: string;
  includeApprovals?: boolean;
}

export interface ICreateReportsBody {
  analysisSetId: string;
  type: ReportType;
  status: ApprovalStatus;
  fileId?: string;
}

export interface IUpdateReportBody {
  status?: ApprovalStatus;
  pseudoStatus?: PseudoStatus | null;
  fileId?: string;
}

export interface IMethodsText {
  wgs?: string;
  rna?: string;
  panel?: string;
  somatic?: string;
  germline?: string;
  meth?: string;
  vaf?: string;
  rnaExpression?: string;
  ipass?: string;
  htsSingle?: string;
  htsCombo?: string;
  aSNP?: string;
  str?: string;
  ihc?: string;
}

export interface IReportContext {
  pageNum: number,
  totalPages: number,
}

export type ClinicService = {
  service?: string;
  hospital?: string;
}
export interface ICancerClinicData {
  location: string;
  service: ClinicService;
  email: string;
}

export interface IAnnex1Row {
  region: string;
  clinics: ICancerClinicData[];
}

export interface IRequiredGroup {
  group: Group;
  label?: Label;
  showOnReport?: boolean;
  status?: ApprovalStatus;
}

export interface IUpdateReportMetadataKey {
  key: ReportMetadataKey;
  value: string;
}
