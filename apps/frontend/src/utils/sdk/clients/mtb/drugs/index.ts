import { AxiosInstance } from 'axios';
import {
  ICreateReportDrug,
  IDetailedReportDrug,
  IDowngradeDrugVersion,
  IFetchReportDrugsQuery,
  IUpdateReportDrug,
} from '../../../../../types/Drugs/Drugs.types';

export interface IClinicalDrugsClient {
  getDetailedReportDrugs: (
    clinicalVersionId: string,
    query: IFetchReportDrugsQuery,
  ) => Promise<IDetailedReportDrug[]>;
  createReportDrug: (
    clinicalVersionId: string,
    drug: ICreateReportDrug,
  ) => Promise<string>;
  updateReportDrug: (
    clinicalVersionId: string,
    drugId: string,
    body: IUpdateReportDrug,
  ) => Promise<void>;
  deleteReportDrug: (
    clinicalVersionId: string,
    drugId: string,
  ) => Promise<void>;
  downgradeClinicalDrugVersion: (
    clinicalVersionId: string,
    body: IDowngradeDrugVersion,
  ) => Promise<void>;
}

export function createClinicalDrugsClient(instance: AxiosInstance): IClinicalDrugsClient {
  async function getDetailedReportDrugs(
    clinicalVersionId: string,
    query: IFetchReportDrugsQuery,
  ):Promise<IDetailedReportDrug[]> {
    const resp = await instance.get<IDetailedReportDrug[]>(`/clinical/${clinicalVersionId}/drug/detailed`, { params: query });
    return resp.data;
  }

  async function createReportDrug(
    clinicalVersionId: string,
    drug: ICreateReportDrug,
  ): Promise<string> {
    const resp = await instance.post<string>(`/clinical/${clinicalVersionId}/drug`, drug);
    return resp.data;
  }

  async function updateReportDrug(
    clinicalVersionId: string,
    drugId: string,
    body: IUpdateReportDrug,
  ): Promise<void> {
    await instance.patch<void>(`/clinical/${clinicalVersionId}/drug/${drugId}`, body);
  }

  async function deleteReportDrug(
    clinicalVersionId: string,
    drugId: string,
  ): Promise<void> {
    await instance.delete<void>(`/clinical/${clinicalVersionId}/drug/${drugId}`);
  }

  async function downgradeClinicalDrugVersion(
    clinicalVersionId: string,
    body: IDowngradeDrugVersion,
  ): Promise<void> {
    await instance.patch<void>(`/clinical/${clinicalVersionId}/drug/downgrade`, body);
  }

  return {
    createReportDrug,
    getDetailedReportDrugs,
    updateReportDrug,
    deleteReportDrug,
    downgradeClinicalDrugVersion,
  };
}
