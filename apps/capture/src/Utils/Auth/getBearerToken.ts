import axios from 'axios';
import { IBearerToken } from 'Models';

export default async function getBearerToken(): Promise<IBearerToken> {
  const query = new URLSearchParams();
  query.append('grant_type', 'client_credentials');
  query.append('client_id', process.env.CAPI_AUTH_AD_CLIENT_ID || '');
  query.append('scope', `${process.env.CAPI_AUTH_AD_CLIENT_ID}/.default`);
  query.append('client_secret', process.env.CAPI_AUTH_AD_CLIENT_SECRET || '');

  const instance = axios.create({
    baseURL: process.env.CAPI_AUTH_AD_METADATA_AUTHORITY,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'content-type': 'application/x-www-form-urlencoded',
    },
  });

  const resp = await instance.post<IBearerToken>(
    `/${process.env.CAPI_AUTH_AD_TENANT_ID}/oauth2/v2.0/token`,
    query.toString(),
  );
  return resp.data;
}
