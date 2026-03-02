export interface ICommonResp {
  id: string;
  name: string;
}

export interface IScopeResp extends ICommonResp {
  applicationId: string;
  applicationName: string;
}
