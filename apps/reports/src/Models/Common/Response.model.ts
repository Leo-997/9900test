export interface ICommonResp<T = string> {
  id: string;
  name: T;
}

export interface IScopeResp extends ICommonResp {
  applicationId: string;
  applicationName: string;
}
