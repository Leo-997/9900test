import { ICommonResp, IScopeResp } from '../Common/Response.model';

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
}

export interface IUserWithMetadata extends IUser, IMetadata {}
