import { AxiosInstance } from 'axios';
import { IUpdateOrder } from '../../../../../types/Common.types';
import {
  ICreateInterpretationBody,
  IInterpretation,
  IInterpretationQuery,
  IUpdateInterpretationBody,
} from '../../../../../types/MTB/Interpretations.types';

export interface IInterpretationsClient {
  createInterpretation: (
    clinicalVersionId: string,
    body: ICreateInterpretationBody,
  ) => Promise<string>;
  getInterpretations: (
    clinicalVersionId: string,
    query: IInterpretationQuery,
    signal?: AbortSignal,
  ) => Promise<IInterpretation[]>;
  getInterpretationById: (
    clinicalVersionId: string,
    id: string,
  ) => Promise<IInterpretation>;
  updateInterpretationOrder: (
    clinicalVersionId: string,
    order: IUpdateOrder[],
  ) => Promise<void>;
  updateInterpretation: (
    clinicalVersionId: string,
    interpretationId: string,
    body: IUpdateInterpretationBody,
  ) => Promise<void>;
  deleteInterpretation: (
    clinicalVersionId: string,
    interpretationId: string,
  ) => Promise<void>;
}

export function createInterpretationsClient(instance: AxiosInstance): IInterpretationsClient {
  async function createInterpretation(
    clinicalVersionId: string,
    body: ICreateInterpretationBody,
  ): Promise<string> {
    const resp = await instance.post<string>(`/clinical/${clinicalVersionId}/interpretations`, body);
    return resp.data;
  }

  async function getInterpretations(
    clinicalVersionId: string,
    query: IInterpretationQuery,
    signal?: AbortSignal,
  ): Promise<IInterpretation[]> {
    const resp = await instance.get<IInterpretation[]>(
      `/clinical/${clinicalVersionId}/interpretations`,
      {
        params: query,
        signal,
      },
    );
    return resp.data;
  }

  async function getInterpretationById(
    clinicalVersionId: string,
    id: string,
  ): Promise<IInterpretation> {
    const resp = await instance.get<IInterpretation>(
      `/clinical/${clinicalVersionId}/interpretations/${id}`,
    );
    return resp.data;
  }

  async function updateInterpretationOrder(
    clinicalVersionId: string,
    order: IUpdateOrder[],
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/interpretations/order`, { order });
  }

  async function updateInterpretation(
    clinicalVersionId: string,
    interpretationId: string,
    body: IUpdateInterpretationBody,
  ): Promise<void> {
    await instance.patch(`/clinical/${clinicalVersionId}/interpretations/${interpretationId}`, body);
  }

  async function deleteInterpretation(
    clinicalVersionId: string,
    interpretationId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/interpretations/${interpretationId}`);
  }

  return {
    createInterpretation,
    getInterpretations,
    getInterpretationById,
    updateInterpretationOrder,
    updateInterpretation,
    deleteInterpretation,
  };
}
