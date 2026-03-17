import { FetchMolecularConfirmation, UpdateMolecularConfirmationBody } from '@/types/MolecularConfirmation.types';
import { AxiosInstance } from 'axios';

export interface IMolecularConfirmationClient {
  getMolecularConfirmation(analysisSetId: string): Promise<FetchMolecularConfirmation | null>;
  updateMolecularConfirmation(
    data: UpdateMolecularConfirmationBody,
    analysisSetId: string
  ): Promise<void>;
}

export function createMolecularConfirmationClient(
  instance: AxiosInstance,
): IMolecularConfirmationClient {
  async function getMolecularConfirmation(
    analysisSetId: string,
  ): Promise<FetchMolecularConfirmation | null> {
    const resp = await instance.get<FetchMolecularConfirmation | null>(
      `analysis/${analysisSetId}/molecular-confirmation`,
    );
    return resp.data;
  }

  async function updateMolecularConfirmation(
    data: UpdateMolecularConfirmationBody,
    analysisSetId: string,
  ): Promise<void> {
    await instance.put<UpdateMolecularConfirmationBody>(
      `analysis/${analysisSetId}/molecular-confirmation/update`,
      data,
    );
  }

  return {
    getMolecularConfirmation,
    updateMolecularConfirmation,
  };
}
