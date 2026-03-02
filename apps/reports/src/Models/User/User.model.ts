import { ICommonResp, IScopeResp } from '../Common/Response.model';
import { IAccessControl } from '../AccessControl/AccessControl.model';

export interface IUser {
  id: string;
  azureId: string;
  givenName: string;
  familyName: string;
  email: string;
  title?: string;
  avatar?: string;
}

export interface IMetadata {
  groups: ICommonResp[];
  roles: ICommonResp[];
  scopes: IScopeResp[];
  accessControls: IAccessControl[];
}

export interface IUserWithMetadata extends IUser, IMetadata {}

export interface IBearerToken {
  token_type: 'Bearer';
  expires_in: number;
  access_token: string;
}
