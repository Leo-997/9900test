import { AxiosInstance } from 'axios';
import {
  IExtendedGene,
  IFilteredGenes,
  IGene,
} from '../../../../../types/Common.types';

interface IGetGeneFilter {
  gene?: string;
  geneIds?: number[];
}

export interface IGeneClient {
  getGenes(filter: IGetGeneFilter): Promise<IGene[]>;
  getGenesByIds(ids: number[]): Promise<IGene[]>;
  getGene(geneId: number): Promise<IExtendedGene>;
  getFilteredGenes(genes: string[]): Promise<IFilteredGenes>;
}

export function createGeneClient(instance: AxiosInstance): IGeneClient {
  async function getGenes({ gene }: IGetGeneFilter): Promise<IGene[]> {
    const resp = await instance.get<IGene[]>('/genes', {
      params: {
        gene,
        limit: 20,
      },
    });

    return resp.data;
  }

  async function getGenesByIds(geneIds: number[]): Promise<IGene[]> {
    const resp = await instance.post<IGene[]>('/genes', {
      geneIds,
    });
    return resp.data;
  }

  async function getGene(geneId: number): Promise<IExtendedGene> {
    const resp = await instance.get<IExtendedGene>(`/genes/${geneId}`);

    return resp.data;
  }

  async function getFilteredGenes(genes: string[]): Promise<IFilteredGenes> {
    const resp = await instance.get<IFilteredGenes>('/filtered_genes', {
      params: {
        genes,
      },
    });

    return resp.data;
  }

  return {
    getGenes,
    getGenesByIds,
    getGene,
    getFilteredGenes,
  };
}
