/* eslint-disable camelcase */
export interface IAccessToken {
  aud: string;
  iss: string;
  iat: number;
  nbf: number;
  exp: number;
  acr: string;
  aio: string;
  amr: string[];
  appid: string;
  appidacr: string;
  email: string;
  family_name: string;
  given_name: string;
  idp: string;
  ipaddr: string;
  name: string;
  oid: string;
  rh: string;
  scp: string;
  sub: string;
  tid: string;
  unique_name: string;
  uti: string;
  ver: string;
}

export interface IBearerToken {
  token_type: 'Bearer';
  expires_in: number;
  access_token: string;
}
