import { AxiosInstance } from 'axios';
import {
  IArmRanges,
  ICreateCytobandBody,
  ICytogeneticsData,
  IGetChromosomeBandsQuery,
  IGetCytobandsQuery,
  ISampleCytoband, IUpdateCytobandBody,
} from '../../../../../types/Cytogenetics.types';

export interface IGermlineCytogeneticsClient {
  getCytogeneticsData(biosampleId: string, signal?: AbortSignal): Promise<ICytogeneticsData[]>
  getCytogeneticsByChromosome(biosampleId: string, variantId: string): Promise<ICytogeneticsData[]>
  getCytobands(
    biosampleId: string,
    query?: IGetCytobandsQuery,
    signal?: AbortSignal,
  ): Promise<ISampleCytoband[]>
  createCytoband(
    biosampleId: string,
    newCytobandBody: ICreateCytobandBody,
  ): Promise<number>;
  updateCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
    updateCytobandBody: IUpdateCytobandBody
  ): Promise<number>;
  deleteCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
  ): Promise<number>;
  updateCytogenetics(data: Partial<ICytogeneticsData>, biosampleId: string): Promise<void>;
  getChromosomeBands(biosampleId: string, query: IGetChromosomeBandsQuery): Promise<IArmRanges[]>;
}

export function createGermlineCytogeneticsClient(
  instance: AxiosInstance,
): IGermlineCytogeneticsClient {
  const baseUrl = (biosampleId: string): string => `/curation/${biosampleId}/germlinecytogenetics`;

  async function getCytogeneticsData(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ICytogeneticsData[]> {
    const resp = await instance.get<ICytogeneticsData[]>(
      baseUrl(biosampleId),
      {
        signal,
      },
    );

    return resp.data;
  }

  async function getCytogeneticsByChromosome(
    biosampleId: string,
    variantId: string,
  ): Promise<ICytogeneticsData[]> {
    const resp = await instance.get<ICytogeneticsData[]>(
      `${baseUrl(biosampleId)}/${variantId}`,
    );

    return resp.data;
  }

  async function getCytobands(
    biosampleId: string,
    query?: IGetCytobandsQuery,
    signal?: AbortSignal,
  ): Promise<ISampleCytoband[]> {
    const resp = await instance.get<ISampleCytoband[]>(
      `${baseUrl(biosampleId)}/cytobands`,
      {
        params: query || {},
        signal,
      },
    );
    return resp.data;
  }

  async function createCytoband(
    biosampleId: string,
    newCytobandBody: ICreateCytobandBody,
  ): Promise<number> {
    const resp = await instance.post<Promise<number>>(
      `${baseUrl(biosampleId)}/cytoband`,
      newCytobandBody,
    );
    return resp.data;
  }

  async function updateCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
    updateCytobandBody: IUpdateCytobandBody,
  ): Promise<number> {
    const resp = await instance.put<number>(
      `${baseUrl(biosampleId)}/${chr}/cytoband/${cytoband}`,
      updateCytobandBody,
    );
    return resp.data;
  }

  async function deleteCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
  ): Promise<number> {
    const resp = await instance.delete<number>(`${baseUrl(biosampleId)}/${chr}/cytoband/${cytoband}`);
    return resp.data;
  }

  async function updateCytogenetics(
    data: Partial<ICytogeneticsData>,
    biosampleId: string,
  ): Promise<void> {
    await instance.put(
      `${baseUrl(biosampleId)}/update`,
      data,
    );
  }

  async function getChromosomeBands(
    biosampleId: string,
    query: IGetChromosomeBandsQuery,
  ): Promise<IArmRanges[]> {
    const resp = await instance.get<IArmRanges[]>(
      `${baseUrl(biosampleId)}/chromosomeBands`,
      {
        params: query || {},
      },
    );
    return resp.data;
  }

  return {
    getCytogeneticsData,
    getCytogeneticsByChromosome,
    getCytobands,
    createCytoband,
    updateCytoband,
    deleteCytoband,
    updateCytogenetics,
    getChromosomeBands,
  };
}
