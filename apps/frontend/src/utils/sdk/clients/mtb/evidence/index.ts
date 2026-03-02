import { AxiosInstance } from 'axios';
import {
  ICreateEvidenceLink, IEvidenceLink, IEvidenceLinkQuery,
  IUpdateEvidenceLinks,
} from '../../../../../types/Evidence/Evidences.types';

export interface IClinicalEvidenceClient {
  getEvidence(
    query: IEvidenceLinkQuery,
    signal?: AbortSignal,
  ): Promise<IEvidenceLink[]>
  getEvidenceById(
    evidenceId: string,
  ): Promise<IEvidenceLink>
  getEvidenceCount(
    query: IEvidenceLinkQuery,
  ): Promise<number>
  createEvidence(
    body: ICreateEvidenceLink,
  ): Promise<string>
  updateEvidence(
    body: IUpdateEvidenceLinks,
  ): Promise<void>
  deleteEvidence(
    clinicalVersionId: string,
    evidenceId: string,
  ): Promise<void>
}

export function createClinicalEvidenceClient(instance: AxiosInstance): IClinicalEvidenceClient {
  async function getEvidence(
    query: IEvidenceLinkQuery,
    signal?: AbortSignal,
  ): Promise<IEvidenceLink[]> {
    const resp = await instance.get<IEvidenceLink[]>(
      '/clinical/evidence',
      {
        params: query,
        signal,
      },
    );
    return resp.data;
  }

  async function getEvidenceById(
    evidenceId: string,
  ): Promise<IEvidenceLink> {
    const resp = await instance.get<IEvidenceLink>(`/clinical/evidence/${evidenceId}`);
    return resp.data;
  }

  async function getEvidenceCount(
    query: IEvidenceLinkQuery,
  ): Promise<number> {
    const resp = await instance.get<number>('/clinical/evidence/count', { params: query });
    return resp.data;
  }

  async function createEvidence(
    body: ICreateEvidenceLink,
  ): Promise<string> {
    const resp = await instance.post<string>('/clinical/evidence', body);
    return resp.data;
  }

  async function updateEvidence(
    body: IUpdateEvidenceLinks,
  ): Promise<void> {
    await instance.put<void>('/clinical/evidence', body);
  }

  async function deleteEvidence(
    evidenceId: string,
  ): Promise<void> {
    await instance.delete<void>(`/clinical/evidence/${evidenceId}`);
  }

  return {
    getEvidence,
    getEvidenceById,
    getEvidenceCount,
    createEvidence,
    updateEvidence,
    deleteEvidence,
  };
}
