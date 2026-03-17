import { AxiosInstance } from 'axios';
import { ISignatureData, IUpdateSignature } from '../../../../../types/MutationalSignatures.types';

export interface IMutationalSignaturesClient {
  getSignatures(biosampleId: string): Promise<ISignatureData[]>;
  getSignatureById(biosampleId: string, variantId: string): Promise<ISignatureData>;
  getReportableSignatures(biosampleId: string): Promise<ISignatureData[]>;
  updateSignature(
    data: IUpdateSignature,
    sigId: string,
    biosampleId: string
  ): Promise<void>;
}

export function createMutationalSignaturesClient(
  instance: AxiosInstance,
): IMutationalSignaturesClient {
  async function getSignatures(biosampleId: string): Promise<ISignatureData[]> {
    const resp = await instance.get<ISignatureData[]>(
      `curation/${biosampleId}/signatures`,
    );

    return resp.data;
  }

  async function getSignatureById(
    biosampleId: string,
    variantId: string,
  ): Promise<ISignatureData> {
    const resp = await instance.get<ISignatureData>(
      `curation/${biosampleId}/signatures/${variantId}`,
    );

    return resp.data;
  }

  async function getReportableSignatures(
    biosampleId: string,
  ): Promise<ISignatureData[]> {
    const resp = await instance.get<ISignatureData[]>(
      `curation/${biosampleId}/signatures?reportable=true`,
    );

    return resp.data;
  }

  async function updateSignature(
    data: IUpdateSignature,
    sigId: string,
    biosampleId: string,
  ): Promise<void> {
    await instance.put(`curation/${biosampleId}/signatures/update/${sigId}`, data);
  }

  return {
    getSignatures,
    getSignatureById,
    getReportableSignatures,
    updateSignature,
  };
}
