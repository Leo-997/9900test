import { DiagnosisFilters } from '@/components/SearchFilterBar/DiagnosisFilterOptions';
import {
  IAnalysisPatient, IAnalysisSet, IAnalysisSetFilters, ICurationSummary, IUpdateAnalysisSetBody,
  IUpdateCurationSummaryBody,
} from '@/types/Analysis/AnalysisSets.types';
import { ClinicalStatus } from '@/types/MTB/ClinicalStatus.types';
import { DiagnosisOptionCombination } from '@/types/MTB/Recommendation.types';
import { AxiosInstance } from 'axios';

export interface IAnalysisSetsClient {
  getAnalysisSetPatients: (
    filters: IAnalysisSetFilters,
    page?: number,
    limit?: number,
  ) => Promise<IAnalysisPatient[]>;
  getAnalysisSets: (
    filters: IAnalysisSetFilters,
    page?: number,
    limit?: number,
  ) => Promise<IAnalysisSet[]>;
  getAnalysisSetsCount: (filters: IAnalysisSetFilters) => Promise<number>;
  getAnalysisSetById: (id: string) => Promise<IAnalysisSet>;
  updateAnalysisSetById: (id: string, body: IUpdateAnalysisSetBody) => Promise<void>;

  triggerExport: (
    analysisSetId: string,
    exportType: 'CASE' | 'HTS',
    clinicalStatus?: ClinicalStatus | 'N/A',
  ) => Promise<void>;

  getSummaries: (analysisSetId: string) => Promise<ICurationSummary[]>;
  updateSummary: (analysisSetId: string, body: IUpdateCurationSummaryBody) => Promise<void>;

  getAllStudies: () => Promise<string[]>;
  getZero2Categories: (filters?: DiagnosisFilters) => Promise<string[]>;
  getZero2Subcategory1: (filters?: DiagnosisFilters) => Promise<string[]>;
  getZero2Subcategory2: (filters?: DiagnosisFilters) => Promise<string[]>;
  getZero2FinalDiagnosis: (filters?: DiagnosisFilters) => Promise<string[]>;
  getZero2DiagnosisOptionCombinations: () => Promise<DiagnosisOptionCombination[]>;
}

export function createAnalysisSetsClient(instance: AxiosInstance): IAnalysisSetsClient {
  async function getAnalysisSetPatients(
    filters: IAnalysisSetFilters,
    page?: number,
    limit?: number,
  ): Promise<IAnalysisPatient[]> {
    const resp = await instance.post<IAnalysisPatient[]>('/analysis/patients', { ...filters, page, limit });
    return resp.data;
  }

  async function getAnalysisSets(
    filters: IAnalysisSetFilters,
    page?: number,
    limit?: number,
  ): Promise<IAnalysisSet[]> {
    const resp = await instance.post<IAnalysisSet[]>('/analysis', { ...filters, page, limit });
    return resp.data;
  }

  async function getAnalysisSetsCount(filters: IAnalysisSetFilters): Promise<number> {
    const resp = await instance.post<number>('/analysis/count', filters);
    return resp.data;
  }

  async function getAnalysisSetById(id: string): Promise<IAnalysisSet> {
    const resp = await instance.get<IAnalysisSet>(`/analysis/${id}`);
    return resp.data;
  }

  async function updateAnalysisSetById(
    id: string,
    body: IUpdateAnalysisSetBody,
  ): Promise<void> {
    await instance.patch<void>(`/analysis/${id}`, body);
  }

  async function triggerExport(
    analysisSetId: string,
    type: 'CASE' | 'HTS',
    clinicalStatus?: ClinicalStatus | 'N/A',
  ): Promise<void> {
    await instance.post(`/analysis/${analysisSetId}/export`, clinicalStatus ? { clinicalStatus, type } : { type });
  }

  async function getSummaries(analysisSetId: string): Promise<ICurationSummary[]> {
    const resp = await instance.get<ICurationSummary[]>(`/analysis/${analysisSetId}/summary`);
    return resp.data;
  }

  async function updateSummary(
    analysisSetId: string,
    body: IUpdateCurationSummaryBody,
  ): Promise<void> {
    await instance.post(`/analysis/${analysisSetId}/summary`, body);
  }

  async function getAllStudies(): Promise<string[]> {
    const resp = await instance.get<string[]>('/analysis/studies');
    return resp.data;
  }

  async function getZero2Categories(filters?: DiagnosisFilters): Promise<string[]> {
    const resp = await instance.post<string[]>('/analysis/zero2/category', filters);
    return resp.data;
  }

  async function getZero2Subcategory1(filters?: DiagnosisFilters): Promise<string[]> {
    const resp = await instance.post<string[]>('/analysis/zero2/subcategory1', filters);
    return resp.data;
  }

  async function getZero2Subcategory2(filters?: DiagnosisFilters): Promise<string[]> {
    const resp = await instance.post<string[]>('/analysis/zero2/subcategory2', filters);
    return resp.data;
  }

  async function getZero2FinalDiagnosis(filters?: DiagnosisFilters): Promise<string[]> {
    const resp = await instance.post<string[]>('/analysis/zero2/final-diagnosis', filters);
    return resp.data;
  }

  async function getZero2DiagnosisOptionCombinations(): Promise<DiagnosisOptionCombination[]> {
    const resp = await instance.get<DiagnosisOptionCombination[]>('/analysis/zero2/diagnosis-option-combinations');
    return resp.data;
  }

  return {
    getAnalysisSetPatients,
    getAnalysisSets,
    getAnalysisSetsCount,
    getAnalysisSetById,
    updateAnalysisSetById,
    triggerExport,
    getSummaries,
    updateSummary,
    getAllStudies,
    getZero2Categories,
    getZero2Subcategory1,
    getZero2Subcategory2,
    getZero2FinalDiagnosis,
    getZero2DiagnosisOptionCombinations,
  };
}
