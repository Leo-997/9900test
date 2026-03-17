import { AxiosInstance } from 'axios';
import {
  IAddendum,
  IHTSDrug,
  IHTSDrugBase,
  IHTSDrugWithScreen,
  IUpdateHTSDrugHitBody,
  IUpdatePastRecommendationBody,
} from '../../../../../types/MTB/Addendum.types';

export interface IAddendumClient {
  getAddendumsByVersionId(clinicalVersionId: string): Promise<IAddendum[]>;
  getActiveAddendum(clinicalVersionId: string): Promise<IAddendum | null>;
  getHTSDrugs(sampleId: string, htsId: string): Promise<IHTSDrugBase[]>;
  getHTSDrugHits(sampleId: string, htsId: string, addendumId: string): Promise<IHTSDrug[]>;
  getHTSDrugsScreeningData(sampleId: string, htsId: string): Promise<IHTSDrugWithScreen[]>;

  createAddendum(createAddendumBody: Partial<IAddendum>): Promise<number>;

  updateHTSDrug(sampleId: string, htsId: string, drugId: string, updateHTSDrugBody: Pick<IHTSDrugBase, 'reportedAs'>): Promise<number>;
  updateHTSDrugHit(
    addendumId: string,
    drugId: string,
    updatedHTSDrugHitBody: IUpdateHTSDrugHitBody
  ): Promise<number>;
  updatePastRecommendation(
    addendumId: string,
    updatePastRecBody: IUpdatePastRecommendationBody
  ): Promise<number>;
  updateAddendum(addendumId: string, updateAddendumBody: Partial<IAddendum>): Promise<number>;
}

export function createAddendumClient(instance: AxiosInstance): IAddendumClient {
  async function getAddendumsByVersionId(
    clinicalVersionId: string,
  ): Promise<IAddendum[]> {
    const resp = await instance.get(`/clinical/addendum/${clinicalVersionId}`);

    return resp.data;
  }

  async function getActiveAddendum(
    clinicalVersionId: string,
  ): Promise<IAddendum | null> {
    const resp = await instance.get(`/clinical/addendum/${clinicalVersionId}/active`);

    return resp.data;
  }

  async function getHTSDrugs(
    sampleId: string,
    htsId: string,
  ): Promise<IHTSDrugBase[]> {
    const resp = await instance.get(`/clinical/addendum/${sampleId}/${htsId}`);

    return resp.data;
  }

  async function getHTSDrugHits(
    sampleId: string,
    htsId: string,
    addendumId: string,
  ): Promise<IHTSDrug[]> {
    const resp = await instance.get(`/clinical/addendum/drug-hits/${sampleId}/${htsId}/${addendumId}`);

    return resp.data;
  }

  async function getHTSDrugsScreeningData(
    sampleId: string,
    htsId: string,
  ): Promise<IHTSDrugWithScreen[]> {
    const resp = await instance.get(`/clinical/addendum/drug-screen/${sampleId}/${htsId}`);

    return resp.data;
  }

  async function createAddendum(
    createAddendumBody: Partial<IAddendum>,
  ): Promise<number> {
    const resp = await instance.post('/clinical/addendum', createAddendumBody);

    return resp.data;
  }

  async function updateHTSDrug(
    sampleId: string,
    htsId: string,
    drugId: string,
    updateHTSDrugBody: Pick<IHTSDrugBase, 'reportedAs'>,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/addendum/${sampleId}/${htsId}/${drugId}`, updateHTSDrugBody);

    return resp.data;
  }

  async function updateHTSDrugHit(
    addendumId: string,
    drugId: string,
    updateHTSDrugHitBody: IUpdateHTSDrugHitBody,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/addendum/drug-hits/${addendumId}/${drugId}`, updateHTSDrugHitBody);

    return resp.data;
  }

  async function updatePastRecommendation(
    addendumId: string,
    updatePastRecBody: IUpdatePastRecommendationBody,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/addendum/past-recs/${addendumId}`, updatePastRecBody);

    return resp.data;
  }

  async function updateAddendum(
    addendumId: string,
    updateAddendumBody: Partial<IAddendum>,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/addendum/${addendumId}`, updateAddendumBody);

    return resp.data;
  }

  return {
    getAddendumsByVersionId,
    getActiveAddendum,
    getHTSDrugs,
    getHTSDrugHits,
    getHTSDrugsScreeningData,

    createAddendum,

    updateHTSDrug,
    updateHTSDrugHit,
    updatePastRecommendation,
    updateAddendum,
  };
}
