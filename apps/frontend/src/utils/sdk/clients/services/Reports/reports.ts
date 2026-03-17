import {
  ICreateGeneListBody, IGeneList, IGetGeneListFilters, IGetPanelReportableNotesQuery,
  IPanelReportableNote,
  IUpdateGeneNote,
  IUpdatePanelReprotableNote,
} from '@/types/Reports/GeneLists.types';
import { AxiosInstance } from 'axios';
import {
  IApprovalBase,
  ICreateApprovalsBody, IGetApprovalsQuery, IUpdateApprovalBody,
} from '../../../../../types/Reports/Approvals.types';
import {
  ICreateReportsBody, IGetReportsQuery, IReport, IUpdateReportBody,
  IUpdateReportMetadataKey,
} from '../../../../../types/Reports/Reports.types';

export interface IReportsClient {
  getReports: (filters: IGetReportsQuery, page?: number, limit?: number) => Promise<IReport[]>;
  getReportsCount: (filters: IGetReportsQuery) => Promise<number>;
  getReportById: (id: string) => Promise<IReport>;
  createReport: (body: ICreateReportsBody) => Promise<string>;
  updateReport: (id: string, body: IUpdateReportBody) => Promise<void>;
  updateReportMetadata: (reportId: string, body: IUpdateReportMetadataKey[]) => Promise<void>;

  // approvals
  getApprovals: (filters: IGetApprovalsQuery) => Promise<IApprovalBase[]>;
  getApprovalById: (id: string) => Promise<IApprovalBase>;
  createApprovals: (body: ICreateApprovalsBody) => Promise<void>;
  updateApproval: (id: string, body: IUpdateApprovalBody) => Promise<void>;

  // gene lists
  getGeneLists: (
    filters: IGetGeneListFilters,
    page?: number,
    limit?: number,
    signal?: AbortSignal,
  ) => Promise<IGeneList[]>;
  getGeneListById: (
    id: string,
  ) => Promise<IGeneList | null>;
  getReportableNotes(
    filters: IGetPanelReportableNotesQuery,
  ): Promise<IPanelReportableNote[]>;
  updateReportableNote(
    body: IUpdatePanelReprotableNote,
  ): Promise<IPanelReportableNote>;
  createGeneList: (body: ICreateGeneListBody) => Promise<IGeneList>;
  updateGeneNote: (body: IUpdateGeneNote) => Promise<void>;
}

export function createReportsClient(instance: AxiosInstance): IReportsClient {
  async function getReports(
    filters: IGetReportsQuery,
    page = 1,
    limit = 100,
  ): Promise<IReport[]> {
    const resp = await instance.post<IReport[]>('/reports/get-all', { ...filters, page, limit });
    return resp.data;
  }

  async function getReportsCount(
    filters: IGetReportsQuery,
  ): Promise<number> {
    const resp = await instance.post<number>('/reports/count', filters);
    return resp.data;
  }

  async function getReportById(id: string): Promise<IReport> {
    const resp = await instance.get<IReport>(`/reports/${id}`);
    return resp.data;
  }

  async function createReport(body: ICreateReportsBody): Promise<string> {
    const resp = await instance.post<string>('/reports', body);
    return resp.data;
  }

  async function updateReport(id: string, body: IUpdateReportBody): Promise<void> {
    await instance.patch(`/reports/${id}`, body);
  }

  async function updateReportMetadata(
    reportId: string,
    body: IUpdateReportMetadataKey[],
  ): Promise<void> {
    await instance.patch(`/reports/${reportId}/metadata`, { metadata: body });
  }

  async function getApprovals(filters: IGetApprovalsQuery): Promise<IApprovalBase[]> {
    const resp = await instance.get<IApprovalBase[]>('/reports/approvals', { params: filters });
    return resp.data;
  }

  async function getApprovalById(id: string): Promise<IApprovalBase> {
    const resp = await instance.get<IApprovalBase>(`/reports/approvals/${id}`);
    return resp.data;
  }

  async function createApprovals(body: ICreateApprovalsBody): Promise<void> {
    await instance.post<void>('/reports/approvals', body);
  }

  async function updateApproval(id: string, body: IUpdateApprovalBody): Promise<void> {
    await instance.patch(`/reports/approvals/${id}`, body);
  }

  async function getGeneLists(
    filters: IGetGeneListFilters,
    page?: number,
    limit?: number,
    signal?: AbortSignal,
  ): Promise<IGeneList[]> {
    const resp = await instance.get<IGeneList[]>(
      '/reports/gene-lists',
      {
        params: {
          ...filters,
          page,
          limit,
        },
        signal,
      },
    );
    return resp.data;
  }

  async function getGeneListById(
    id: string,
  ): Promise<IGeneList | null> {
    const resp = await instance.get<IGeneList | null>(`/reports/gene-lists/${id}`);
    return resp.data;
  }

  async function createGeneList(body: ICreateGeneListBody): Promise<IGeneList> {
    const resp = await instance.post<IGeneList>('/reports/gene-lists', body);
    return resp.data;
  }

  async function getReportableNotes(
    filters: IGetPanelReportableNotesQuery,
  ): Promise<IPanelReportableNote[]> {
    const resp = await instance.get<IPanelReportableNote[]>(
      '/reports/gene-lists/reportable-notes',
      { params: filters },
    );
    return resp.data;
  }

  async function updateReportableNote(
    body: IUpdatePanelReprotableNote,
  ): Promise<IPanelReportableNote> {
    const resp = await instance.post<IPanelReportableNote>(
      '/reports/gene-lists/reportable-notes',
      body,
    );
    return resp.data;
  }

  async function updateGeneNote(
    body: IUpdateGeneNote,
  ): Promise<void> {
    await instance.post<void>('/reports/gene-lists/gene-note', body);
  }

  return {
    getReports,
    getReportsCount,
    getReportById,
    createReport,
    updateReport,
    updateReportMetadata,
    getApprovals,
    getApprovalById,
    createApprovals,
    updateApproval,
    getGeneLists,
    getGeneListById,
    createGeneList,
    getReportableNotes,
    updateReportableNote,
    updateGeneNote,
  };
}
