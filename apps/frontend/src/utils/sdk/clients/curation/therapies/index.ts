import {
  ICreateCurationTherapy, ICurationTherapy, ITherapiesQuery, ITherapyXref,
} from '@/types/Therapies/CurationTherapies.types';
import { AxiosInstance } from 'axios';

export interface ICurationTherapiesClient {
  getTherapies(
    filters: ITherapiesQuery,
    page?: number,
    limit?: number,
  ): Promise<ICurationTherapy[]>;
  getTherapyById(id: string): Promise<ICurationTherapy>;
  createTherapy(data: ICreateCurationTherapy): Promise<string>;
  linkTherapy(data: ITherapyXref): Promise<void>;
  unlinkTherapy(data: ITherapyXref): Promise<void>;
  getTherapiesCount(query: ITherapiesQuery): Promise<number>;
  }

export function createCurationTherapiesClient(
  instance: AxiosInstance,
): ICurationTherapiesClient {
  async function getTherapies(
    filters: ITherapiesQuery,
    page?: number,
    limit?: number,
  ): Promise<ICurationTherapy[]> {
    const resp = await instance.get<ICurationTherapy[]>('/curation-therapies', {
      params: {
        page,
        limit,
        ...filters,
      },
    });

    return resp.data;
  }

  async function getTherapyById(id: string): Promise<ICurationTherapy> {
    const resp = await instance.get<ICurationTherapy>(`/curation-therapies/${id}`);
    return resp.data;
  }

  async function createTherapy(data: ICreateCurationTherapy): Promise<string> {
    const resp = await instance.post<string>('/curation-therapies', data);
    return resp.data;
  }

  async function linkTherapy(data: ITherapyXref): Promise<void> {
    await instance.post<void>('/curation-therapies/link-therapy', data);
  }

  async function unlinkTherapy(data: ITherapyXref): Promise<void> {
    await instance.delete<void>('/curation-therapies/link-therapy', { data });
  }

  async function getTherapiesCount(query: ITherapiesQuery): Promise<number> {
    const resp = await instance.get<number>(
      '/curation-therapies/count',
      { params: query },
    );
    return resp.data;
  }

  return {
    getTherapies,
    getTherapyById,
    createTherapy,
    linkTherapy,
    unlinkTherapy,
    getTherapiesCount,
  };
}
