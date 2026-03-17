import { AxiosInstance } from 'axios';
import {
  ICitationFilters, ICitationWithMeta, IExternalCitation, IExternalCitationQuery,
} from '../../../../../types/Evidence/Citations.types';
import { ICreateEvidence, IEvidence, IEvidenceQuery } from '../../../../../types/Evidence/Evidences.types';
import { IResourceWithMeta, IResourceFilters, IUpdateResourceBody } from '../../../../../types/Evidence/Resources.types';

export interface IEvidenceClient {
  getEvidenceById(
    evidenceId: string
  ): Promise<IEvidence>;
  getAllEvidence(
    filters: IEvidenceQuery
  ): Promise<IEvidence[]>;
  getEvidenceCount(
    filters: IEvidenceQuery
  ): Promise<number>;
  getCitationById(
    citationId: string
  ): Promise<ICitationWithMeta>;
  getAllCitations(
    filters: ICitationFilters
  ): Promise<ICitationWithMeta[]>;
  getExternalCitation(
    query: IExternalCitationQuery,
  ): Promise<IExternalCitation>;
  getResourceById(
    resourceId: string
  ): Promise<IResourceWithMeta>;
  getAllResources(
    filters: IResourceFilters
  ): Promise<IResourceWithMeta[]>;
  addEvidence(
    data: ICreateEvidence
  ): Promise<string>;
  updateResource(
    resourceId: string,
    data: IUpdateResourceBody,
  ): Promise<void>;
}

export function createEvidenceClient(instance: AxiosInstance): IEvidenceClient {
  async function getEvidenceById(evidenceId: string): Promise<IEvidence> {
    const resp = await instance.get(`/evidence/${evidenceId}`);

    return resp.data;
  }

  async function getAllEvidence(filters: IEvidenceQuery): Promise<IEvidence[]> {
    const resp = await instance.post('/evidence/all', filters);

    return resp.data;
  }

  async function getEvidenceCount(filters: IEvidenceQuery): Promise<number> {
    const resp = await instance.post('/evidence/count', filters);

    return resp.data;
  }

  async function getCitationById(citationId: string): Promise<ICitationWithMeta> {
    const resp = await instance.get(`/evidence/citation/${citationId}`);

    return resp.data;
  }

  async function getAllCitations(filters: ICitationFilters): Promise<ICitationWithMeta[]> {
    const resp = await instance.post<ICitationWithMeta[]>('/evidence/citation/all', filters);

    return resp.data;
  }

  async function getExternalCitation(query: IExternalCitationQuery): Promise<IExternalCitation> {
    const resp = await instance.get('/evidence/citation/external', {
      params: query,
    });

    return resp.data;
  }

  async function getResourceById(resourceId: string): Promise<IResourceWithMeta> {
    const resp = await instance.get(`/evidence/resource/${resourceId}`);

    return resp.data;
  }

  async function getAllResources(filters: IResourceFilters): Promise<IResourceWithMeta[]> {
    const resp = await instance.post<IResourceWithMeta[]>('/evidence/resource/all', filters);

    return resp.data;
  }

  async function addEvidence(data: ICreateEvidence): Promise<string> {
    const resp = await instance.post('/evidence', data);

    return resp.data;
  }

  async function updateResource(resourceId: string, data: IUpdateResourceBody): Promise<void> {
    await instance.put(`/evidence/resource/${resourceId}`, data);
  }

  return {
    getAllEvidence,
    getEvidenceCount,
    getEvidenceById,
    getCitationById,
    getAllCitations,
    getExternalCitation,
    getResourceById,
    getAllResources,
    addEvidence,
    updateResource,
  };
}
