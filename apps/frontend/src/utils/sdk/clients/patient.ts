import { AxiosInstance } from 'axios';
import {
  IAccessiblePatient, IAccessiblePatientQuery, IPatient, IPatientDemographics,
  IPatientGermlineConsent,
} from '../../../types/Patient/Patient.types';

interface IUpdatePatient {
  clinicalHistory?: string;
  comments?: string;
}

export interface IPatientSample {
  patientId: string;
  tumourId: string;
  rnaseqId: string;
  normalId: string;
  methId: string;
  donorId: string;
  zcc_subject_id: string;
}

export interface IPatientClient {
  getAccessiblePatients(query: IAccessiblePatientQuery): Promise<IAccessiblePatient[]>;
  getPatientById(patientId: string): Promise<IPatient>;
  updatePatient(
    patientId: string,
    data: IUpdatePatient,
  ): Promise<void>;
  getPatientDemographics(patientId: string, eventNumber?: number): Promise<IPatientDemographics>;
  getPatientConsent(patientId: string): Promise<IPatientGermlineConsent>;
}

export function createPatientClient(instance: AxiosInstance): IPatientClient {
  async function getAccessiblePatients(
    query: IAccessiblePatientQuery,
  ): Promise<IAccessiblePatient[]> {
    const resp = await instance.get<IAccessiblePatient[]>(
      '/patients/accessible',
      {
        params: query,
      },
    );

    return resp.data;
  }

  async function getPatientById(patientId: string): Promise<IPatient> {
    const resp = await instance.get<IPatient>(`/patients/${patientId}`);

    return resp.data;
  }

  async function updatePatient(
    patientId: string,
    data: IUpdatePatient,
  ): Promise<void> {
    await instance.patch(`/patients/${patientId}`, data);
  }

  async function getPatientDemographics(
    patientId: string,
    eventNumber?: number,
  ): Promise<IPatientDemographics> {
    const resp = await instance.get<IPatientDemographics>(
      `/data-capture/patient/${patientId}/demographics`,
      {
        params: {
          eventNumber,
        },
      },
    );
    return resp.data;
  }

  async function getPatientConsent(patientId: string): Promise<IPatientGermlineConsent> {
    const resp = await instance.get<IPatientGermlineConsent>(
      `/data-capture/patient/${patientId}/consent`,
    );

    return resp.data;
  }

  return {
    getAccessiblePatients,
    getPatientById,
    updatePatient,
    getPatientDemographics,
    getPatientConsent,
  };
}
