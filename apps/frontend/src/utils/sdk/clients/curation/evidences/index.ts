import { AxiosInstance } from 'axios';
import {
  ICreateEvidenceLink, IEvidenceLink, IEvidenceLinkQuery, IUpdateEvidenceLinks,
} from '../../../../../types/Evidence/Evidences.types';

export interface ICurationEvidencesClient {
  getEvidence(
    filters: IEvidenceLinkQuery,
    signal?: AbortSignal,
  ): Promise<IEvidenceLink[]>;
  createNewEvidence(data: ICreateEvidenceLink): Promise<string>;
  updateEvidence(data: IUpdateEvidenceLinks): Promise<void>;
  deleteEvidence(evidenceId: string): Promise<void>
}

export function createEvidencesClient(
  instance: AxiosInstance,
): ICurationEvidencesClient {
  async function getEvidence(
    filters: IEvidenceLinkQuery,
    signal?: AbortSignal,
  ): Promise<IEvidenceLink[]> {
    const resp = await instance.get<IEvidenceLink[]>('/curation/evidence', {
      params: filters,
      signal,
    });

    return resp.data;
  }

  async function createNewEvidence(
    data: ICreateEvidenceLink,
  ): Promise<string> {
    const resp = await instance.post<string>('/curation/evidence', data);
    return resp.data;
  }

  async function updateEvidence(
    data: IUpdateEvidenceLinks,
  ): Promise<void> {
    await instance.put<void>('/curation/evidence', data);
  }

  async function deleteEvidence(evidenceId: string): Promise<void> {
    await instance.delete(`/curation/evidence/${evidenceId}`);
  }

  return {
    getEvidence,
    deleteEvidence,
    createNewEvidence,
    updateEvidence,
  };
}
