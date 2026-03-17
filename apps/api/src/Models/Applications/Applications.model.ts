import { ICommonResp } from 'Models/Common/Response.model';

export interface IApplication {
  id: string;
  name: string;
  azureId: string;
}

export interface IApplicationWithRoles extends IApplication {
  roles: ICommonResp[];
}
