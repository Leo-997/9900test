import { AxiosInstance } from 'axios';
import { ISampleDetail } from '../../../../../types/Samples/Sample.types';
import {
  IMolecularAlterationDetail,
  IMolecularAlterationUpdateDto,
  IMolAlterationSampleDetails,
  IMolecularAlterationFilter,
  IMolAlterationSampleDetailsRequest,
} from '../../../../../types/MTB/MolecularAlteration.types';
import { IUpdateOrder } from '../../../../../types/Common.types';

export interface IMolecularAlterationClient {
  getMolAlterations(
    clinicalVersionId: string,
    query: IMolecularAlterationFilter,
    signal?: AbortSignal,
  ): Promise<IMolecularAlterationDetail[]>;
  getMolAlterationById(
    clinicalVersionId: string,
    molAlterationId: string,
  ): Promise<IMolecularAlterationDetail>;
  getMolAlterationDetails(
    clinicalVersionId: string,
    request: IMolAlterationSampleDetailsRequest,
  ): Promise<ISampleDetail[]>;
  updateMolAlteration(
    clinicalVersionId: string,
    data: IMolecularAlterationUpdateDto,
    molAlterationId: string,
  ): Promise<void>;
  updateMolAlterationSummaryOrder(
    clinicalVersionId: string,
    order: IUpdateOrder[],
  ): Promise<void>;
  getMolSampleDetailsByIds: (
    clinicalVersionId: string,
    groupId: string,
    molAlterationId: string,
  ) => Promise<IMolAlterationSampleDetails>;
  createMolAlterationsGroup: (
    clinicalVersionId: string,
    alterations: string[],
  ) => Promise<string>;
  updateMolAlterationsGroup: (
    clinicalVersionId: string,
    groupId: string,
    alterations: string[],
  ) => Promise<string>;
  deleteMolAlterationsGroup: (
    clinicalVersionId: string,
    groupId: string,
  ) => Promise<void>;
}
export function createMolAlterationClient(
  instance: AxiosInstance,
): IMolecularAlterationClient {
  async function getMolAlterations(
    clinicalVersionId: string,
    query: IMolecularAlterationFilter,
    signal?: AbortSignal,
  ): Promise<IMolecularAlterationDetail[]> {
    const resp = await instance.get<IMolecularAlterationDetail[]>(
      `/clinical/${clinicalVersionId}/mol-alterations`,
      {
        params: query,
        signal,
      },
    );

    return resp.data;
  }

  async function getMolAlterationById(
    clinicalVersionId: string,
    molAlterationId: string,
  ): Promise<IMolecularAlterationDetail> {
    const resp = await instance.get<IMolecularAlterationDetail>(
      `/clinical/${clinicalVersionId}/mol-alterations/${molAlterationId}`,
    );
    return resp.data;
  }

  async function updateMolAlteration(
    clinicalVersionId: string,
    data: IMolecularAlterationUpdateDto,
    molAlterationId: string,
  ): Promise<void> {
    await instance.put(`/clinical/${clinicalVersionId}/mol-alterations/${molAlterationId}`, data);
  }

  async function updateMolAlterationSummaryOrder(
    clinicalVersionId: string,
    order: IUpdateOrder[],
  ): Promise<void> {
    await instance.put(`/clinical/${clinicalVersionId}/mol-alterations/order`, {
      order,
    });
  }

  async function getMolAlterationDetails(
    clinicalVersionId: string,
    request: IMolAlterationSampleDetailsRequest,
  ): Promise<ISampleDetail[]> {
    const resp = await instance.post<ISampleDetail[]>(
      `/clinical/${clinicalVersionId}/mol-alterations/details`,
      request,
    );
    return resp.data;
  }

  async function getMolSampleDetailsByIds(
    clinicalVersionId: string,
    groupId: string,
    molAlterationId: string,
  ): Promise<IMolAlterationSampleDetails> {
    const resp = await instance.get(
      `/clinical/${clinicalVersionId}/mol-alterations/sample-details/${groupId}/${molAlterationId}`,
    );
    const modifiedData = {
      ...resp.data,
      // Convert json string into json object
      additionalData: JSON.parse(resp.data.additionalData),
    };
    return modifiedData;
  }

  async function createMolAlterationsGroup(
    clinicalVersionId: string,
    alterations: string[],
  ): Promise<string> {
    const resp = await instance.post<string>(`/clinical/${clinicalVersionId}/mol-alterations/group`, { alterations });
    return resp.data;
  }

  async function updateMolAlterationsGroup(
    clinicalVersionId: string,
    groupId: string,
    alterations: string[],
  ): Promise<string> {
    const resp = await instance.put<string>(`/clinical/${clinicalVersionId}/mol-alterations/group/${groupId}`, { alterations });
    return resp.data;
  }

  async function deleteMolAlterationsGroup(
    clinicalVersionId: string,
    groupId: string,
  ): Promise<void> {
    const resp = await instance.delete(`/clinical/${clinicalVersionId}/mol-alterations/group/${groupId}`);
    return resp.data;
  }

  return {
    getMolAlterations,
    getMolAlterationById,
    updateMolAlteration,
    updateMolAlterationSummaryOrder,
    getMolAlterationDetails,
    getMolSampleDetailsByIds,
    createMolAlterationsGroup,
    updateMolAlterationsGroup,
    deleteMolAlterationsGroup,
  };
}
