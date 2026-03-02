import { Group } from '@/types/Auth/Group.types';
import { PseudoStatus } from '@/types/TaskDashboard/TaskDashboard.types';
import { AxiosInstance } from 'axios';
import { IClinicalDashboardSample } from '../../../../../types/Dashboard.types';
import { ClinicalStatus } from '../../../../../types/MTB/ClinicalStatus.types';
import {
  IClinicalVersionRaw, UpdateClinicalVersionBody,
} from '../../../../../types/MTB/MTB.types';
import { IPatientDetails } from '../../../../../types/Patient/Patient.types';
import {
  IAssignReviewerBody,
  IClinicalSample,
} from '../../../../../types/Samples/Sample.types';
import { IClinicalDashboardSearchOptions } from '../../../../../types/Search.types';

export interface IClinicalDashboardFilters {
  search?: string[];
  analysisSetIds?: string[];
  expedited?: boolean;
  gender?: string[];
  vitalStatus?: string[];
  ageRange?: number[];
  eventType?: string[];
  startMtb?: string;
  endMtb?: string;
  startEnrolment?: string;
  endEnrolment?: string;
  zero2FinalDiagnosis?: string[];
  sortColumns?: string[];
  sortDirections?: string[];
  clinicalStatus?: ClinicalStatus[];
  pseudoStatuses?: PseudoStatus[];
  assignees?: string[];
}

export interface IClinicalClient {
  getRecords(
    filters?: IClinicalDashboardFilters,
    page?: number,
    limit?: number
  ): Promise<IClinicalDashboardSample[]>;
  getRecordsCount(filters?: IClinicalDashboardFilters): Promise<number>;
  getPatientDetails(patientId: string): Promise<IPatientDetails>;
  getActiveSample(sampleId: string): Promise<IClinicalSample>;
  getClinicalVersionById(versionId: string): Promise<IClinicalVersionRaw>;
  getLatestClinicalVersion(sampleId: string): Promise<IClinicalVersionRaw>;
  updateClinicalVersionData(
    clinicalVersionId: string,
    data: UpdateClinicalVersionBody,
  ): Promise<number>;
  addReviewer(versionId: string, body: IAssignReviewerBody): Promise<void>;
  removeReviewer(versionId: string, group: Group): Promise<void>;
  updateReviewStatus(
    versionId: string,
    group: Group,
    status: string
  ): Promise<void>;
  mapFilters(
    dbFilters: IClinicalDashboardSearchOptions
  ): IClinicalDashboardFilters;
}

export function createClinicalClient(instance: AxiosInstance): IClinicalClient {
  async function getRecords(
    filters?: IClinicalDashboardFilters,
    page = 1,
    limit = 100,
  ): Promise<IClinicalDashboardSample[]> {
    const resp = await instance.post<IClinicalDashboardSample[]>(
      '/clinical/sample',
      { ...filters, page, limit },
    );
    return resp.data;
  }

  async function getRecordsCount(
    filters?: IClinicalDashboardFilters,
  ): Promise<number> {
    const resp = await instance.post<number>('/clinical/sample/count', filters);
    return resp.data;
  }

  async function getPatientDetails(
    patientId: string,
  ): Promise<IPatientDetails> {
    const resp = await instance.get<IPatientDetails>(
      `/clinical/patient/${patientId}`,
    );
    return resp.data;
  }

  async function getActiveSample(sampleId: string): Promise<IClinicalSample> {
    const resp = await instance.get<IClinicalSample>(
      `/clinical/sample/${sampleId}`,
    );
    return resp.data;
  }

  async function getClinicalVersionById(
    versionId: string,
  ): Promise<IClinicalVersionRaw> {
    const resp = await instance.get<IClinicalVersionRaw>(
      `/clinical/sample/version/${versionId}`,
    );
    return resp.data;
  }

  async function getLatestClinicalVersion(
    sampleId: string,
  ): Promise<IClinicalVersionRaw> {
    const resp = await instance.get<IClinicalVersionRaw>(
      `/clinical/sample/${sampleId}/version/latest`,
    );
    return resp.data;
  }

  async function updateClinicalVersionData(
    clinicalVersionId: string,
    data: UpdateClinicalVersionBody,
  ): Promise<number> {
    const resp = await instance.put(`/clinical/sample/${clinicalVersionId}`, data);

    return resp.data;
  }

  async function addReviewer(
    clinicalVersionId: string,
    body: IAssignReviewerBody,
  ): Promise<void> {
    await instance.post(`/clinical/sample/${clinicalVersionId}/reviewer`, body);
  }

  async function removeReviewer(
    clinicalVersionId: string,
    group: Group,
  ): Promise<void> {
    await instance.delete(`/clinical/sample/${clinicalVersionId}/${group}`);
  }

  async function updateReviewStatus(
    clinicalVersionId: string,
    group: Group,
    status: string,
  ): Promise<void> {
    await instance.put(`/clinical/sample/${clinicalVersionId}/review-status`, {
      status,
      group,
    });
  }

  function mapFilters(
    dbFilters: IClinicalDashboardSearchOptions,
  ): IClinicalDashboardFilters {
    const {
      searchId,
      expedited,
      gender,
      vitalStatus,
      ageRange,
      eventType,
      zero2FinalDiagnosis,
      sortColumns,
      sortDirections,
      clinicalStatus,
      assignees,
    } = dbFilters;

    const filters: IClinicalDashboardFilters = {};

    if (searchId && searchId.length > 0) filters.search = searchId;

    if (expedited) filters.expedited = expedited;

    if (gender && gender.length > 0) filters.gender = gender;

    if (vitalStatus && vitalStatus.length > 0) filters.vitalStatus = vitalStatus;

    if (ageRange) {
      filters.ageRange = ageRange;
    }

    if (eventType && eventType.length > 0) {
      filters.eventType = eventType;
    }

    if (dbFilters.startMtb) {
      filters.startMtb = dbFilters.startMtb;
    }

    if (dbFilters.endMtb) {
      filters.endMtb = dbFilters.endMtb;
    }

    if (dbFilters.startEnrolment) {
      filters.startEnrolment = dbFilters.startEnrolment;
    }

    if (dbFilters.endEnrolment) {
      filters.endEnrolment = dbFilters.endEnrolment;
    }

    if (zero2FinalDiagnosis && zero2FinalDiagnosis.length > 0) {
      filters.zero2FinalDiagnosis = zero2FinalDiagnosis;
    }

    if (clinicalStatus && clinicalStatus.length > 0) {
      filters.clinicalStatus = clinicalStatus;
    }

    if (assignees && assignees.length > 0) {
      filters.assignees = assignees.map((c) => c.split('::')[1]);
    }

    if (sortColumns && sortColumns.length > 0) {
      filters.sortColumns = sortColumns;
      filters.sortDirections = sortDirections;
    }

    return filters;
  }

  return {
    getRecords,
    getRecordsCount,
    getPatientDetails,
    getActiveSample,
    getClinicalVersionById,
    getLatestClinicalVersion,
    updateClinicalVersionData,
    addReviewer,
    removeReviewer,
    updateReviewStatus,
    mapFilters,
  };
}
