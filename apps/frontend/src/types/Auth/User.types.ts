import { ICommonResp, IScopeResp } from '../Common.types';
import { Group } from './Group.types';
import { Role } from './Role.types';
import { Scope } from './Scope.types';

export interface IUser {
  id: string;
  azureId: string;
  givenName: string;
  familyName: string;
  email: string;
  title?: string;
  avatar?: string;
  isApplication?: boolean;
  isActive?: boolean;
}

export interface IMetadata {
  groups: ICommonResp<Group>[];
  roles: ICommonResp<Role>[];
  studies: ICommonResp<string>[];
  sites: ICommonResp<string>[];
  scopes: IScopeResp<Scope>[];
}

export interface IUserWithMetadata extends IUser, IMetadata {}

export interface IAvatar {
  background?: string,
  border?: string,
  url?: string,
}

export type CuratorType = 'Primary' | 'Secondary';

export interface IUserFilters {
  includeApplication?: boolean;
  includeInactive?: boolean;
}
