import { AxiosInstance } from 'axios';
import { IMatchingTherapiesQuery } from '../../../../../types/Therapies/ClinicalTherapies.types';

export interface ITherapiesClient {
  getMatchingTherapies(
    query: IMatchingTherapiesQuery,
  ): Promise<string[]>;
}

export function createTherapiesClient(
  instance: AxiosInstance,
): ITherapiesClient {
  async function getMatchingTherapies(
    query: IMatchingTherapiesQuery,
  ): Promise<string[]> {
    const resp = await instance.get<string[]>('/clinical/therapy/matching-therapies', { params: query });

    return resp.data;
  }

  return {
    getMatchingTherapies,
  };
}
