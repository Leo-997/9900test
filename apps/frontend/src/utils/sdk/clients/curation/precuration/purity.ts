import { IPurity, IPurityFilters } from '@/types/Precuration/Purity.types';
import { AxiosInstance } from 'axios';

export interface IPurityClient {
  getPurity: (filters: IPurityFilters) => Promise<IPurity[]>;
  getPurityById: (purityId: string) => Promise<IPurity>;
}

export function createPurityClient(instance: AxiosInstance): IPurityClient {
  async function getPurity(filters: IPurityFilters): Promise<IPurity[]> {
    const resp = await instance.get<IPurity[]>('/purity', { params: filters });
    return resp.data;
  }

  async function getPurityById(purityId: string): Promise<IPurity> {
    const resp = await instance.get<IPurity>(`/purity/${purityId}`);
    return resp.data;
  }

  return {
    getPurity,
    getPurityById,
  };
}
