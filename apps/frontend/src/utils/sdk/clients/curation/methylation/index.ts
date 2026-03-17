import { AxiosInstance } from 'axios';
import {
  IClassifierGroup,
  IClassifierResult,
  ICohortStats,
  IGetClassifierGroupsQuery,
  IMethCounts,
  IMethGeneTable,
  IMethResultFilters,
  IMethylationData,
  IMethylationGeneData,
  IMethylationPredictionData,
} from '../../../../../types/Methylation.types';
import type { IClassifierVersion, IClassifierVersionFilters, UpdateClassifierVersion } from '@/types/Classifiers.types';

export interface IMethylationClient {
  getMethylationData(
    biosampleId: string,
    filters?: IMethResultFilters,
    signal?: AbortSignal,
  ): Promise<IMethylationData[]>;
  updateMethylationByGroupId(
    data: Partial<IMethylationData>,
    biosampleId: string,
    groupId: string,
  ): Promise<void>;
  getMethylationPrediction(biosampleId: string): Promise<IMethylationPredictionData>;
  updateMethylationPrediction(
    data: Partial<IMethylationPredictionData>,
    biosampleId: string,
  ): Promise<void>;
  getClassifiers(query?: IClassifierVersionFilters): Promise<IClassifierVersion[]>;
  updateClassifier(
    classifierId: string,
    data: UpdateClassifierVersion
  ): Promise<void>;
  getClassifierGroups(
    filters: IGetClassifierGroupsQuery,
    page?: number,
    limit?: number,
  ): Promise<IClassifierGroup[]>;
  createNewClassifierItem(biosampleId:string, data: IClassifierResult): Promise<void>;
  getMethylationGeneData(
    biosampleId: string,
    filters?: IMethResultFilters,
  ): Promise<IMethylationGeneData[]>;
  getMGMTCohort(
    biosampleId: string,
  ): Promise<ICohortStats[]>;
  countMethMGMT(
    biosampleId: string,
  ): Promise<IMethCounts>;
  getMethGeneTable(biosampleId: string, gene: string): Promise<IMethGeneTable[]>;
  updateMethylationGene(
    data: Partial<IMethylationGeneData>,
    biosampleId: string,
    geneId: string,
  ): Promise<void>;
}

export function createMethylationClient(instance: AxiosInstance): IMethylationClient {
  async function getMethylationData(
    biosampleId: string,
    filters?: IMethResultFilters,
    signal?: AbortSignal,
  ): Promise<IMethylationData[]> {
    const resp = await instance.get<IMethylationData[]>(
      `/curation/${biosampleId}/methylation/`,
      {
        params: filters,
        signal,
      },
    );

    return resp.data;
  }

  async function updateMethylationByGroupId(
    data: Partial<IMethylationData>,
    biosampleId: string,
    groupId: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/methylation/update/${groupId}`,
      data,
    );
  }

  async function getMethylationPrediction(
    biosampleId: string,
  ): Promise<IMethylationPredictionData> {
    const resp = await instance.get<IMethylationPredictionData>(`/curation/${biosampleId}/methylation/prediction`);

    return resp.data;
  }

  async function updateMethylationPrediction(
    data: Partial<IMethylationPredictionData>,
    biosampleId: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/methylation/prediction`,
      data,
    );
  }

  async function getClassifiers(
    query?: IClassifierVersionFilters,
  ): Promise<IClassifierVersion[]> {
    const resp = await instance.get<IClassifierVersion[]>(
      '/methylation-classifiers',
      {
        params: query,
      },
    );

    return resp.data;
  }

  async function updateClassifier(
    classifierId: string,
    data: UpdateClassifierVersion,
  ): Promise<void> {
    await instance.patch(
      `/methylation-classifiers/${classifierId}`,
      data,
    );
  }

  async function getClassifierGroups(
    filters: IGetClassifierGroupsQuery,
    page = 1,
    limit = 100,
  ): Promise<IClassifierGroup[]> {
    const resp = await instance.get<IClassifierGroup[]>(
      '/methylation-classifiers/groups',
      {
        params: {
          ...filters,
          page,
          limit,
        },
      },
    );

    return resp.data;
  }

  async function createNewClassifierItem(
    biosampleId: string,
    data: IClassifierResult,
  ): Promise<void> {
    await instance.post(
      `/curation/${biosampleId}/methylation/result`,
      {
        groupId: data.group,
        score: data.score,
        interpretation: data.interpretation,
      },
    );
  }

  async function getMethylationGeneData(
    biosampleId: string,
    filters?: IMethResultFilters,
  ): Promise<IMethylationGeneData[]> {
    const resp = await instance.get<IMethylationGeneData[]>(
      `/curation/${biosampleId}/methylation/genes`,
      {
        params: filters,
      },
    );
    return resp.data;
  }

  async function getMGMTCohort(
    biosampleId: string,
  ): Promise<ICohortStats[]> {
    const resp = await instance.get<ICohortStats[]>(
      `/curation/${biosampleId}/methylation/cohort`,
    );
    return resp.data;
  }

  async function countMethMGMT(
    biosampleId: string,
  ): Promise<IMethCounts> {
    const resp = await instance.get<IMethCounts>(
      `/curation/${biosampleId}/methylation/cohortCount`,
    );
    return resp.data;
  }

  async function getMethGeneTable(biosampleId: string, gene: string): Promise<IMethGeneTable[]> {
    const resp = await instance.get<IMethGeneTable[]>(`/curation/${biosampleId}/methylation/genes/${gene}`);
    return resp.data;
  }

  async function updateMethylationGene(
    data: Partial<IMethylationGeneData>,
    biosampleId: string,
    geneId: string,
  ): Promise<void> {
    await instance.put(
      `/curation/${biosampleId}/methylation/gene/${geneId}`,
      data,
    );
  }

  return {
    getMethylationData,
    getMethGeneTable,
    getMGMTCohort,
    countMethMGMT,
    updateMethylationByGroupId,
    getMethylationPrediction,
    updateMethylationPrediction,
    getClassifiers,
    updateClassifier,
    getClassifierGroups,
    createNewClassifierItem,
    getMethylationGeneData,
    updateMethylationGene,
  };
}
