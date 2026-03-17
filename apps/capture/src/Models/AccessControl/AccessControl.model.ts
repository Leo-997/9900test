import { ICommonResp } from 'Models/Common/Response.model';

export interface IAccessiblePatient {
  patientId?: string;
  analysisSetId?: string;
  biosampleId?: string;
  isReadOnly?: boolean;
  isFullCaseAccess?: boolean;
}

export interface IAccessControl {
  id: string;
  userId: string;
  study?: ICommonResp;
  site?: ICommonResp;
  patientId?: string;
  biosampleId?: string;
  isReadonly: boolean;
}
