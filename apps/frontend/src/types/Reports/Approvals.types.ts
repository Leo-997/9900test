import { approvalStatuses } from '../../constants/Reports/status';
import { Group } from '../Auth/Group.types';
import { IChipProps } from '../Samples/Sample.types';

export type ApprovalStatus = typeof approvalStatuses[number];

export interface ICurrentApprovalStatus {
  status: ApprovalStatus;
  chips: {
    chipProps: IChipProps;
  }[];
}

export type ApprovalStatuses = {
  [key in ApprovalStatus]: ICurrentApprovalStatus;
}

export type Label = 'Reported by' | 'Authorised by' | null;

export interface IApprovalBase {
  id: string;
  reportId: string;
  status: ApprovalStatus;
  label: Label | null;
  showOnReport: boolean;
  groupId: string;
  assigneeId: string | null;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  notifiedAt?: string;
}

export interface IApproval extends IApprovalBase {
  groupName: Group | null;
}
export interface IGetApprovalsQuery {
  id?: string;
  reportId?: string;
  status?: ApprovalStatus;
  groupId?: string | null;
  label?: Label;
  showOnReport?: boolean;
  assigneeId?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface ICreateApproval {
  status: ApprovalStatus;
  groupId?: string | null;
  label?: Label;
  showOnReport?: boolean;
  assigneeId?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface ICreateApprovalsBody {
  reportId: string;
  approvals: ICreateApproval[];
}

export interface IUpdateApprovalBody {
  patientId?: string;
  status?: ApprovalStatus;
  showOnReport?: boolean;
  assigneeId?: string | null;
  sendNotifications?: boolean;
  notifiedAt?: string;
}
