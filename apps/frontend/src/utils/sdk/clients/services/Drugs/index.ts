import { AxiosInstance } from 'axios';
import {
  ICreateDrug,
  ICreateDrugResponse,
  IDrugClassFilters,
  IDrugFilters,
  IDrugMetadata,
  IExternalDrug,
  IUpdateDrug,
  IUpdateDrugResponse,
} from '../../../../../types/Drugs/Drugs.types';
import { IDrugScreen, IDrugScreenFilters } from '../../../../../types/Drugs/Screen.types';
import { CreateExternalTrial, IExternalTrial, IExternalTrialFilters } from '../../../../../types/Drugs/Trials.types';

export interface IDrugsClient {
  addDrug(
    newDrugData: ICreateDrug
  ): Promise<ICreateDrugResponse>;
  updateDrug(
    versionId: string,
    updatedDrug: IUpdateDrug
  ): Promise<IUpdateDrugResponse>;
  getDrugs(
    filters: IDrugFilters,
    page?: number,
    limit?: number
  ): Promise<IExternalDrug[]>;
  rejectDrug(drugId: string): Promise<string | null>;
  getDrugClasses(
    drugClassFilters: IDrugClassFilters,
    page?: number,
    limit?: number
  ): Promise<IDrugMetadata[]>;
  getTargets(): Promise<IDrugMetadata[]>;
  getPathways(): Promise<IDrugMetadata[]>;
  getDrugScreens(
    filters: IDrugScreenFilters
  ): Promise<IDrugScreen[]>;
  addDrugEvidence(
    drugId: string,
    evidenceId: string,
    clinicalSummary?: string,
    evidenceLevels?: string[]
  ): Promise<number>;

  // trials in drug MS
  getExternalTrials(
    filters?: IExternalTrialFilters,
    page?: number,
    limit?: number,
  ): Promise<IExternalTrial[]>;
  upsertExternalTrial(
    body: CreateExternalTrial,
  ): Promise<IExternalTrial>;
}

export function createDrugsClient(
  instance: AxiosInstance,
): IDrugsClient {
  async function addDrug(
    newDrugData: ICreateDrug,
  ): Promise<ICreateDrugResponse> {
    const resp = await instance.post('/drugs', newDrugData);
    return resp.data;
  }

  async function updateDrug(
    versionId: string,
    updatedDrug: IUpdateDrug,
  ): Promise<IUpdateDrugResponse> {
    const resp = await instance.put(`/drugs/${versionId}`, updatedDrug);
    return resp.data;
  }

  async function getDrugs(
    filters: IDrugFilters,
    page?: number,
    limit?: number,
  ): Promise<IExternalDrug[]> {
    const resp = await instance.get('/drugs', {
      params: {
        ...filters,
        page,
        limit,
      },
    });
    return resp.data;
  }

  async function rejectDrug(drugId: string): Promise<string | null> {
    const resp = await instance.delete(`/drugs/reject/${drugId}`);
    return resp.data;
  }

  async function getDrugClasses(
    drugClassFilters: IDrugClassFilters,
    page?: number,
    limit?: number,
  ): Promise<IDrugMetadata[]> {
    const resp = await instance.get('/drugs/classes', {
      params: {
        ...drugClassFilters,
        page,
        limit,
      },
    });

    return resp.data;
  }

  async function getTargets(): Promise<IDrugMetadata[]> {
    const resp = await instance.get('/drugs/targets');
    return resp.data;
  }

  async function getPathways(): Promise<IDrugMetadata[]> {
    const resp = await instance.get('/drugs/pathways');
    return resp.data;
  }

  async function getDrugScreens(
    filters: IDrugScreenFilters,
  ): Promise<IDrugScreen[]> {
    const resp = await instance.get<IDrugScreen[]>('/drugs/screen', {
      params: filters,
    });
    return resp.data;
  }

  async function addDrugEvidence(
    drugId: string,
    evidenceId: string,
    clinicalSummary?: string,
    evidenceLevels?: string[],
  ): Promise<number> {
    const resp = await instance.post(`/drugs/${drugId}/evidence`, {
      drugId,
      clinicalSummary,
      evidenceLevels,
      evidenceId,
    });

    return resp.data;
  }

  async function getExternalTrials(
    filters: IExternalTrialFilters,
    page = 1,
    limit = 100,
  ): Promise<IExternalTrial[]> {
    const resp = await instance.get('/drugs/trials', {
      params: {
        ...filters,
        page,
        limit,
      },
    });
    return resp.data;
  }

  async function upsertExternalTrial(
    body: CreateExternalTrial,
  ): Promise<IExternalTrial> {
    const resp = await instance.put('/drugs/trials', body);
    return resp.data;
  }

  return {
    addDrug,
    updateDrug,
    rejectDrug,
    getDrugs,
    getDrugClasses,
    getTargets,
    getPathways,
    getDrugScreens,
    addDrugEvidence,
    getExternalTrials,
    upsertExternalTrial,
  };
}
