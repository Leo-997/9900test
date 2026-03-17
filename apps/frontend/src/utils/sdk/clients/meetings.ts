import { IAnalysisSet } from '@/types/Analysis/AnalysisSets.types';
import { AxiosInstance } from 'axios';
import {
  IClinicalDashboardSample,
} from '../../../types/Dashboard.types';
import {
  IAssignMultipleClinicalMeetingsBody,
  IUpdateClinicalMeetingDashboardChairBody,
  IUpdateClinicalMeetingChairBody,
  IUpdateClinicalMeetingDateBody,
} from '../../../types/Meetings/Meetings.types';

export interface IMeetingUpdateBody {
  sampleId?: string;
  date?: string | null;
  completed?: boolean;
  sampleIdArray?: string[];
}

export interface ICurationMeetingUpdateBody {
  analysisSets: string[];
  date: string | null;
}

export interface ICurationMeeting {
  meetingId: string;
  date: string;
  analysisSets?: IAnalysisSet[];
}

export interface ICurationMeetingFilters {
  date?: string;
  window?: 'month' | 'day';
  includeAnalysisSets?: boolean;
}

export interface IMeetingClient {
  assignCurationMeeting(data: ICurationMeetingUpdateBody): Promise<void>;
  getCurationMeetings(
    filters: ICurationMeetingFilters
  ): Promise<ICurationMeeting[]>;
  assignMultipleCurationMeetings(
    data: IMeetingUpdateBody,
  ): Promise<void>;

  // CLINICAL
  updateClinicalMeetingDashboardChair(
    body: IUpdateClinicalMeetingDashboardChairBody,
  ): Promise<number>;
  updateClinicalMeetingDate(
    clinicalVersionId: string,
    body: IUpdateClinicalMeetingDateBody,
  ): Promise<number>;
  updateClinicalMeetingChair(
    clinicalVersionId: string,
    body: IUpdateClinicalMeetingChairBody,
  ): Promise<number>;
  assignMultipleClinicalMeetings(
    body: IAssignMultipleClinicalMeetingsBody,
  ): Promise<void>;
  getClinicalMeetingChair(
    date: string,
  ): Promise<string | null>;
  getClinicalMeetingSamples(
    date: string,
    page?: number,
    limit?: number,
  ): Promise<IClinicalDashboardSample[]>;
  getClinicalMeetingsInAMonth(
    date: string
  ): Promise<string[]>; // return the dates that have a meeting
}

export const createMeetingClient = (
  instance: AxiosInstance,
): IMeetingClient => {
  /* CURATION */

  async function assignCurationMeeting(data: IMeetingUpdateBody): Promise<void> {
    await instance.post('/meetings', data);
  }

  async function assignMultipleCurationMeetings(
    data: IMeetingUpdateBody,
  ): Promise<void> {
    await instance.post(`/meetings/multiple?date=${data.date}`, data);
  }

  async function getCurationMeetings(
    filters: ICurationMeetingFilters,
  ): Promise<ICurationMeeting[]> {
    const response = await instance.get<ICurationMeeting[]>(
      '/meetings/month',
      {
        params: filters,
      },
    );
    return response.data;
  }

  /* CLINICAL */

  async function updateClinicalMeetingDashboardChair(
    body: IUpdateClinicalMeetingDashboardChairBody,
  ): Promise<number> {
    const resp = await instance.put(
      '/clinical/meetings/chair',
      body,
    );

    return resp.data;
  }

  async function updateClinicalMeetingDate(
    clinicalVersionId: string,
    body: IUpdateClinicalMeetingDateBody,
  ): Promise<number> {
    const resp = await instance.put(
      `/clinical/meetings/${clinicalVersionId}/date`,
      body,
    );

    return resp.data;
  }

  async function updateClinicalMeetingChair(
    clinicalVersionId: string,
    body: IUpdateClinicalMeetingChairBody,
  ): Promise<number> {
    const resp = await instance.put(
      `/clinical/meetings/${clinicalVersionId}/chair`,
      body,
    );

    return resp.data;
  }

  async function assignMultipleClinicalMeetings(
    body: IAssignMultipleClinicalMeetingsBody,
  ): Promise<void> {
    await instance.put(
      '/clinical/meetings/multiple',
      body,
    );
  }

  async function getClinicalMeetingChair(
    date: string,
  ): Promise<string | null> {
    const resp = await instance.get(`/clinical/meetings/chair?date=${date}`);

    return resp.data;
  }

  async function getClinicalMeetingSamples(
    date: string,
    page = 1,
    limit = 10,
  ): Promise<IClinicalDashboardSample[]> {
    const resp = await instance.get(
      '/clinical/meetings/records',
      {
        params: {
          date,
          page,
          limit,
        },
      },
    );

    return resp.data;
  }

  async function getClinicalMeetingsInAMonth(
    date: string,
  ): Promise<string[]> {
    const resp = await instance.get(`/clinical/meetings/month?date=${date}`);

    return resp.data;
  }

  return {
    assignCurationMeeting,
    assignMultipleCurationMeetings,
    getCurationMeetings,
    updateClinicalMeetingDate,
    updateClinicalMeetingChair,
    assignMultipleClinicalMeetings,
    updateClinicalMeetingDashboardChair,
    getClinicalMeetingsInAMonth,
    getClinicalMeetingSamples,
    getClinicalMeetingChair,
  };
};
