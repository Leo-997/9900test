import { AxiosInstance } from 'axios';
import { IUpdateOrder } from '../../../../../types/Common.types';
import {
  CreateRecommendation,
  ICreateRecommendationLink,
  IFetchRecommendation,
  IFetchRecommendationFilters,
  IUpdateRecommendation,
  RecLinkEntityType,
} from '../../../../../types/MTB/Recommendation.types';

export interface IRecommendationClient {
  addRecommendation<RecType extends CreateRecommendation>(
    clinicalVersionId: string,
    data: RecType,
  ): Promise<string>;
  getRecommendationById(
    clinicalVersionId: string,
    recommendationId: string,
  ): Promise<IFetchRecommendation>;
  getRecommendationsByAddendumId(
    clinicalVersionId: string,
    addendumId: string,
  ): Promise<IFetchRecommendation[]>;
  getAllRecommendations(
    clinicalVersionId: string,
    filters: IFetchRecommendationFilters,
    page?: number,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<IFetchRecommendation[]>;
  updateRecommendationOrder(
    clinicalVersionId: string,
    entityType: RecLinkEntityType,
    entityId: string,
    order: IUpdateOrder[],
  ): Promise<void>;
  updateRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    data: IUpdateRecommendation,
  ): Promise<number>;
  deleteRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
  ): Promise<void>;
  deleteRecommendationsWithRejectedDrug(
    clinicalVersionId: string,
    drugVersionId: string
  ): Promise<void>;
  createRecommendationsLink(
    clinicalVersionId: string,
    body: ICreateRecommendationLink,
  ): Promise<void>;
}

export function createRecommendationClient(
  instance: AxiosInstance,
): IRecommendationClient {
  async function addRecommendation<TYPE extends CreateRecommendation>(
    clinicalVersionId: string,
    data: TYPE,
  ): Promise<string> {
    const resp = await instance.post(`/clinical/${clinicalVersionId}/recommendations`, data);

    return resp.data;
  }

  async function getRecommendationById(
    clinicalVersionId: string,
    recommendationId: string,
  ): Promise<IFetchRecommendation> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/recommendations/${recommendationId}`);

    return resp.data;
  }

  async function getRecommendationsByAddendumId(
    clinicalVersionId: string,
    addendumId: string,
  ): Promise<IFetchRecommendation[]> {
    const resp = await instance.get(`/clinical/${clinicalVersionId}/recommendations/${addendumId}/hts`);

    return resp.data;
  }

  async function getAllRecommendations(
    clinicalVersionId: string,
    filters?: IFetchRecommendationFilters,
    page?: number,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<IFetchRecommendation[]> {
    const resp = await instance.get(
      `/clinical/${clinicalVersionId}/recommendations`,
      {
        params: {
          ...filters,
          page,
          limit,
        },
        signal,
      },
    );

    return resp.data;
  }

  async function updateRecommendationOrder(
    clinicalVersionId: string,
    entityType: RecLinkEntityType,
    entityId: string,
    order: IUpdateOrder[],
  ): Promise<void> {
    const resp = await instance.put(`/clinical/${clinicalVersionId}/recommendations/order`, {
      order,
      entityType,
      entityId,
    });

    return resp.data;
  }

  async function updateRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    data: IUpdateRecommendation,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/${clinicalVersionId}/recommendations/${recommendationId}`, data);

    return resp.data;
  }

  async function deleteRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/recommendations/${recommendationId}`);
  }

  async function deleteRecommendationsWithRejectedDrug(
    clinicalVersionId: string,
    drugVersionId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/recommendations/drugVersion/${drugVersionId}`);
  }

  async function createRecommendationsLink(
    clinicalVersionId: string,
    body: ICreateRecommendationLink,
  ): Promise<void> {
    await instance.post<void>(`/clinical/${clinicalVersionId}/recommendations/link`, body);
  }

  return {
    addRecommendation,
    getRecommendationById,
    getRecommendationsByAddendumId,
    getAllRecommendations,
    updateRecommendationOrder,
    updateRecommendation,
    deleteRecommendation,
    deleteRecommendationsWithRejectedDrug,
    createRecommendationsLink,
  };
}
