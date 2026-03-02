import { AxiosInstance } from 'axios';
import {
  IAnnotations,
  IArmRanges,
  ICreateCytobandBody,
  ICytobandCN,
  ICytogeneticsData,
  IGetAverageCopyNumberQuery,
  IGetChromosomeBandsQuery,
  IGetCytobandsQuery,
  ISampleCytoband, IUpdateCytobandBody,
} from '../../../../../types/Cytogenetics.types';

export interface ISomaticCytogeneticsClient {
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
  getAnnotations(biosampleId: string): Promise<IAnnotations>;
  getAnnotationsByChromosome(biosampleId: string, variantId: string): Promise<IAnnotations>;
  updateCytogenetics(data: Partial<ICytogeneticsData>, biosampleId: string): Promise<void>;
  getChromosomeBands(biosampleId: string, query: IGetChromosomeBandsQuery): Promise<IArmRanges[]>;
  getAverageCopyNumber(
    biosampleId: string,
    query: IGetAverageCopyNumberQuery,
  ): Promise<ICytobandCN>;
}

export function createSomaticCytogeneticsClient(
  instance: AxiosInstance,
): ISomaticCytogeneticsClient {
  async function getCytogeneticsData(
    biosampleId: string,
    signal?: AbortSignal,
  ): Promise<ICytogeneticsData[]> {
    const resp = await instance.get<ICytogeneticsData[]>(
      `/curation/${biosampleId}/cytogenetics`,
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
      `/curation/${biosampleId}/cytogenetics/${variantId}`,
    );

    return resp.data;
  }

  async function getCytobands(
    biosampleId: string,
    query?: IGetCytobandsQuery,
    signal?: AbortSignal,
  ): Promise<ISampleCytoband[]> {
    const resp = await instance.get<ISampleCytoband[]>(
      `/curation/${biosampleId}/cytogenetics/cytobands`,
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
      `/curation/${biosampleId}/cytogenetics/cytoband`,
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
      `/curation/${biosampleId}/cytogenetics/${chr}/cytoband/${cytoband}`,
      updateCytobandBody,
    );
    return resp.data;
  }

  async function deleteCytoband(
    biosampleId: string,
    chr: string,
    cytoband: string,
  ): Promise<number> {
    const resp = await instance.delete<number>(`/curation/${biosampleId}/cytogenetics/${chr}/cytoband/${cytoband}`);
    return resp.data;
  }

  async function updateCytogenetics(
    data: Partial<ICytogeneticsData>,
    biosampleId: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/cytogenetics/update`,
      data,
    );
  }

  async function getAnnotations(biosampleId: string): Promise<IAnnotations> {
    const resp = await instance.get<IAnnotations>(`/curation/${biosampleId}/cytogenetics/genes`);

    return resp.data;
  }

  async function getAnnotationsByChromosome(
    biosampleId: string,
    variantId: string,
  ): Promise<IAnnotations> {
    const resp = await instance.get<IAnnotations>(`/curation/${biosampleId}/cytogenetics/genes/${variantId}`);

    return resp.data;
  }

  async function getChromosomeBands(
    biosampleId: string,
    query: IGetChromosomeBandsQuery,
  ): Promise<IArmRanges[]> {
    const resp = await instance.get<IArmRanges[]>(
      `/curation/${biosampleId}/cytogenetics/chromosomeBands`,
      {
        params: query || {},
      },
    );
    return resp.data;
  }

  async function getAverageCopyNumber(
    biosampleId: string,
    query: IGetAverageCopyNumberQuery,
  ): Promise<ICytobandCN> {
    const resp = await instance.get<ICytobandCN>(
      `/curation/${biosampleId}/cytogenetics/avgCopyNumber`,
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
    getAnnotations,
    getAnnotationsByChromosome,
    getChromosomeBands,
    getAverageCopyNumber,
  };
}
