import { AxiosInstance } from 'axios';
import {
  ClinicalInformationData,
} from '../../../../../../types/MTB/ClinicalInfo.types';

export interface IClinicalInfoClient {
  createClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
    data: ClinicalInformationData
  ): Promise<string>;
  updateClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
    data: ClinicalInformationData
  ): Promise<number>;
  deleteClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<void>;
  getClinicalInformation(
    clinicalVersionId: string,
    slideId: string
  ): Promise<ClinicalInformationData | undefined>;
}

export function createClinicalInfoClient(
  instance: AxiosInstance,
): IClinicalInfoClient {
  async function createClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
    data: ClinicalInformationData,
  ): Promise<string> {
    const resp = await instance.post(
      `/clinical/${clinicalVersionId}/clinical-info/${slideId}/information`,
      data,
    );

    return resp.data;
  }

  async function updateClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
    data: ClinicalInformationData,
  ): Promise<number> {
    const resp = await instance.put(
      `/clinical/${clinicalVersionId}/clinical-info/${slideId}/information`,
      data,
    );

    return resp.data;
  }

  async function deleteClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/${clinicalVersionId}/clinical-info/${slideId}`);
  }

  async function getClinicalInformation(
    clinicalVersionId: string,
    slideId: string,
  ): Promise<ClinicalInformationData | undefined> {
    const resp = await instance.get(
      `/clinical/${clinicalVersionId}/clinical-info/${slideId}/information`,
    );
    return resp.data;
  }

  return {
    createClinicalInformation,
    updateClinicalInformation,
    deleteClinicalInformation,
    getClinicalInformation,
  };
}
