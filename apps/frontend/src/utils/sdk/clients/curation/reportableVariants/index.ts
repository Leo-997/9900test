import { AxiosInstance } from 'axios';
import {
  IGetReportableVariantData,
  IGetReportableVariantQuery,
  IUpdateReportableVariantBody,
} from '../../../../../types/Reports/ReportableVariants.types';

export interface IReportableVariantsClient {
  getReportableVariants: (
    analysisSetId: string,
    query: IGetReportableVariantQuery,
    signal?: AbortSignal,
  ) => Promise<IGetReportableVariantData[]>;
  updateReportableVariant: (
    analysisSetId: string,
    biosampleId: string,
    body: IUpdateReportableVariantBody,
  ) => Promise<void>;
}

export function createReportableVariantsClient(
  instance: AxiosInstance,
): IReportableVariantsClient {
  async function getReportableVariants(
    analysisSetId: string,
    query: IGetReportableVariantQuery,
    signal?: AbortSignal,
  ): Promise<IGetReportableVariantData[]> {
    const resp = await instance.get<IGetReportableVariantData[]>(
      `curation/${analysisSetId}/reportable-variants`,
      {
        params: query,
        signal,
      },
    );
    return resp.data;
  }

  async function updateReportableVariant(
    analysisSetId: string,
    biosampleId: string,
    body: IUpdateReportableVariantBody,
  ): Promise<void> {
    await instance.put<void>(
      `curation/${analysisSetId}/reportable-variants/${biosampleId}`,
      body,
    );
  }

  return {
    getReportableVariants,
    updateReportableVariant,
  };
}
