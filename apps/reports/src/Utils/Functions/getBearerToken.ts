import { HttpService } from '@nestjs/axios';
import { IBearerToken } from 'Models/User/User.model';

export default async function getBearerToken(): Promise<IBearerToken> {
  const query = new URLSearchParams();
  query.append('grant_type', 'client_credentials');
  query.append('client_id', process.env.VITE_AUTH_CLIENT_ID || '');
  query.append('scope', `${process.env.VITE_AUTH_CLIENT_ID}/.default`);
  query.append('client_secret', process.env.AUTH_AD_CLIENT_SECRET || '');

  const httpService = new HttpService();

  const resp = await httpService.axiosRef.post<IBearerToken>(
    `https://${process.env.VITE_AUTH_CLOUD_AUTHORITY}/${process.env.VITE_AUTH_TENANT_ID}/oauth2/v2.0/token`,
    query.toString(),
    {
      headers: {

        'content-type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return resp.data;
}
