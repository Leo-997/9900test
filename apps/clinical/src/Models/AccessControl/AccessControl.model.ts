import { ICommonResp } from 'Models/Common/Response.model';

export interface IAccessControl {
  id: string;
  userId: string;
  study?: ICommonResp;
  site?: ICommonResp;
  patientId?: string;
  biosampleId?: string;
  isReadonly: boolean;
}

export const IS_WRITE_ENDPOINT_KEY = 'isWriteEndpoint';
