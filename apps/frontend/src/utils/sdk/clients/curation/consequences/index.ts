import { AxiosInstance } from 'axios';
import { ImpactGroups, Impact } from '../../../../../types/Common.types';

interface IGetConsequencesQuery {
  impact?: Impact;
}

export interface IConsequencesClient {
  getConsequences(filters?: IGetConsequencesQuery): Promise<ImpactGroups | string[]>;
}

export function createConsequencesClient(instance: AxiosInstance): IConsequencesClient {
  async function getConsequences(
    filters?: IGetConsequencesQuery,
  ): Promise<ImpactGroups | string[]> {
    const resp = await instance.get('/consequences', {
      params: {
        ...filters,
      },
    });

    return resp.data;
  }

  return {
    getConsequences,
  };
}
