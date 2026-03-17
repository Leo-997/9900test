import { IWarningAcknowledgement } from '@/types/Samples/Sample.types';
import { AxiosInstance } from 'axios';

export interface IPrecurationValidationClient {
  checkWarningAcknowledgement(
    analysisSetId: string
  ): Promise<boolean>;
  addWarningAcknowledgement(
    analysisSetId: string,
    data: IWarningAcknowledgement,
  ): Promise<void>;
}

export function createPrecurationValidationClient(
  instance: AxiosInstance,
): IPrecurationValidationClient {
  async function checkWarningAcknowledgement(analysisSetId: string): Promise<boolean> {
    const resp = await instance.get<boolean>(`/validation/${analysisSetId}`);
    return resp.data;
  }

  async function addWarningAcknowledgement(
    analysisSetId: string,
    data: IWarningAcknowledgement,
  ): Promise<void> {
    await instance.post(`/validation/${analysisSetId}`, data);
  }

  return {
    checkWarningAcknowledgement,
    addWarningAcknowledgement,
  };
}
