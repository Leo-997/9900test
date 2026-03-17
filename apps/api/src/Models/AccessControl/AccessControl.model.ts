import { IsOptional, IsString } from 'class-validator';
import { ICommonResp } from 'Models/Common/Response.model';

export const IS_WRITE_ENDPOINT_KEY = 'IsWriteEndpoint' as const;

export interface IAccessControl {
  id: string;
  userId: string;
  study?: ICommonResp;
  site?: ICommonResp;
  patientId?: string;
  biosampleId?: string;
  isReadonly: boolean;
}

export interface IAccessiblePatient {
  study: string;
  site: string;
  patientId: string;
  analysisSetId?: string;
  biosampleId?: string;
  isReadOnly: boolean;
  isFullCaseAccess: boolean;
}

export interface IAccessiblePatientQuery {
  patientId?: string;
  analysisSetId?: string;
  biosampleId?: string;
}

export class AccessiblePatientQueryDTO implements IAccessiblePatientQuery {
  @IsOptional()
  @IsString()
    patientId?: string;

  @IsOptional()
  @IsString()
    analysisSetId?: string;

  @IsOptional()
  @IsString()
    biosampleId?: string;
}
