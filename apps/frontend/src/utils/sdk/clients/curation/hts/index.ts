import { AxiosInstance } from 'axios';
import {
  HTSCorrelation,
  HTSReportingRationale,
  HTSResultSummary,
  IGetHTSResultQuery,
  IHTSCulture,
  IHTSDrugCombination,
  IHTSDrugCombinationQuery,
  IHTSResult,
  IUpdateHTSCultureBody,
} from '../../../../../types/HTS.types';

export interface IUpdateHTSResultByIdBody {
  reportTargets?: string;
  reportable?: boolean | null;
  reportingRationale?: HTSReportingRationale | null;
  correlation?: HTSCorrelation | null;
}

export interface IUpdateHTSByIdBody {
  comments?: string;
}

export interface IHTSClient {
  getHTSCulture(biosampleId: string): Promise<IHTSCulture[]>;
  getHTSResults(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    page?: number,
    limit?: number
  ): Promise<IHTSResult[]>;
  getHTSResultsCount(
    biosampleId: string,
    filters: IGetHTSResultQuery,
  ): Promise<number>;
  getHTSResultById(
    biosampleId: string,
    screenId: string,
  ): Promise<IHTSResult>;
  getZScoreSummary(biosampleId: string): Promise<HTSResultSummary>;
  updateHtsResultById(
    data: IUpdateHTSResultByIdBody,
    biosampleId: string,
    screenId: string
  ): Promise<number>;
  updateHtsCulture(
    biosampleId: string,
    screenName: string,
    body: IUpdateHTSCultureBody
  ): Promise<void>;
  getDrugCombinations(
    biosampleId: string,
    filters?: IHTSDrugCombinationQuery,
  ): Promise<IHTSDrugCombination[]>;
  getDrugCombinationsById(
      biosampleId: string,
      combinationId: string,
    ): Promise<IHTSDrugCombination[]>;
  createDrugCombination(
      biosampleId: string,
      body: Omit<IHTSDrugCombination, 'id'>,
    ): Promise<string>;
  updateDrugCombination(
      biosampleId: string,
      id: string,
      body: Partial<Omit<IHTSDrugCombination, 'id'>>,
    ): Promise<void>;
}

export function createHtsClient(instance: AxiosInstance): IHTSClient {
  async function getHTSCulture(biosampleId: string): Promise<IHTSCulture[]> {
    const resp = await instance.get<IHTSCulture[]>(`/curation/${biosampleId}/hts/culture`);
    return resp.data;
  }

  async function getHTSResults(
    biosampleId: string,
    filters: IGetHTSResultQuery,
    page = 1,
    limit = 100,
  ): Promise<IHTSResult[]> {
    const resp = await instance.post<IHTSResult[]>(
      `/curation/${biosampleId}/hts/results`,
      {
        ...filters,
        page,
        limit,
      },
    );
    return resp.data;
  }

  async function getHTSResultsCount(
    biosampleId: string,
    filters: IGetHTSResultQuery,
  ): Promise<number> {
    const resp = await instance.post<number>(
      `/curation/${biosampleId}/hts/results/count`,
      {
        ...filters,
      },
    );
    return resp.data;
  }

  async function getHTSResultById(
    biosampleId: string,
    screenId: string,
  ): Promise<IHTSResult> {
    const resp = await instance.get<IHTSResult>(
      `/curation/${biosampleId}/hts/results/${screenId}`,
    );
    return resp.data;
  }

  async function getZScoreSummary(
    biosampleId: string,
  ): Promise<HTSResultSummary> {
    const resp = await instance.get<HTSResultSummary>(
      `/curation/${biosampleId}/hts/summary`,
    );

    return resp.data;
  }

  async function updateHtsResultById(
    data: IUpdateHTSResultByIdBody,
    biosampleId: string,
    screenId: string,
  ): Promise<number> {
    const resp = await instance.put<number>(
      `/curation/${biosampleId}/hts/results/${screenId}`,
      data,
    );

    return resp.data;
  }

  async function updateHtsCulture(
    biosampleId: string,
    screenName: string,
    body: IUpdateHTSCultureBody,
  ): Promise<void> {
    await instance.patch(
      `/curation/${biosampleId}/hts/culture/${screenName}`,
      body,
    );
  }

  async function getDrugCombinations(
    biosampleId: string,
    filters: IGetHTSResultQuery,
  ): Promise<IHTSDrugCombination[]> {
    const resp = await instance.post<IHTSDrugCombination[]>(
      `/curation/${biosampleId}/hts/combinations`,
      filters,
    );

    return resp.data;
  }

  async function getDrugCombinationsById(
    biosampleId: string,
    combinationId: string,
  ): Promise<IHTSDrugCombination[]> {
    const resp = await instance.get<IHTSDrugCombination[]>(
      `/curation/${biosampleId}/hts/combinations/${combinationId}`,
    );

    return resp.data;
  }

  async function createDrugCombination(
    biosampleId: string,
    body: Omit<IHTSDrugCombination, 'id'>,
  ): Promise<string> {
    const resp = await instance.post<string>(
      `/curation/${biosampleId}/hts/combinations/new`,
      body,
    );

    return resp.data;
  }

  async function updateDrugCombination(
    biosampleId: string,
    id: string,
    body: Partial<Omit<IHTSDrugCombination, 'id'>>,
  ): Promise<void> {
    await instance.patch<void>(
      `/curation/${biosampleId}/hts/combinations/${id}`,
      body,
    );
  }

  return {
    getHTSCulture,
    getZScoreSummary,
    getHTSResults,
    getHTSResultsCount,
    getHTSResultById,
    updateHtsResultById,
    updateHtsCulture,
    getDrugCombinations,
    getDrugCombinationsById,
    createDrugCombination,
    updateDrugCombination,
  };
}
