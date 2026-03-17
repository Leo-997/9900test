import {
  IBiosample, IBiosampleFilters, IPipeline, IPipelinesFilters,
} from '@/types/Analysis/Biosamples.types';
import { AxiosInstance } from 'axios';

export interface IBiosamplesClient {
  getBiosamples: (
    filters: IBiosampleFilters,
    page?: number,
    limit?: number,
  ) => Promise<IBiosample[]>;
  getBiosamplesCount: (filters: IBiosampleFilters) => Promise<number>;
  getBiosampleById: (id: string) => Promise<IBiosample>;
  getPipelines: (filters: IPipelinesFilters) => Promise<IPipeline[]>;
}

export function createBiosamplesClient(instance: AxiosInstance): IBiosamplesClient {
  async function getBiosamples(
    filters: IBiosampleFilters,
    page?: number,
    limit?: number,
  ): Promise<IBiosample[]> {
    const resp = await instance.get<IBiosample[]>('/biosamples', {
      params: { ...filters, page, limit },
    });
    return resp.data;
  }

  async function getBiosamplesCount(filters: IBiosampleFilters): Promise<number> {
    const resp = await instance.get<number>('/biosamples/count', { params: filters });
    return resp.data;
  }

  async function getBiosampleById(id: string): Promise<IBiosample> {
    const resp = await instance.get<IBiosample>(`/biosamples/${id}`);
    return resp.data;
  }

  async function getPipelines(
    filters: IPipelinesFilters,
    page?: number,
    limit?: number,
  ): Promise<IPipeline[]> {
    const resp = await instance.get<IPipeline[]>(
      '/biosamples/pipelines',
      { params: { ...filters, page, limit } },
    );
    return resp.data;
  }

  return {
    getBiosamples,
    getBiosamplesCount,
    getBiosampleById,
    getPipelines,
  };
}
