import { IAccessControl } from 'Models/AccessControl/AccessControl.model';
import { ICommonResp, IScopeResp } from 'Models/Common/Response.model';
import { IsOptional, IsString } from 'class-validator';

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

export interface IMentionedUser {
  id: string;
  slackId: string;
  fullName: string;
}

export class UserDTO
implements IUser {
  @IsString()
    id: string;

  @IsString()
    azureId: string;

  @IsString()
    givenName: string;

  @IsString()
    familyName: string;

  @IsString()
    email: string;

  @IsString()
  @IsOptional()
    title?: string;

  @IsString()
  @IsOptional()
    avatar?: string;
}
