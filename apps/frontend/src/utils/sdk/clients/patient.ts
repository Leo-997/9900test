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
    return {
      firstName: 'Bruce',
      lastName: 'Wayne',
      dateOfBirth: '03-Mar-2020',
      treatingOncologist: 'Alfred Pennyworth',
      site: 'Starship Hospital',
      events: [
        { eventNumber: '1', event: 'Diagnosis of cancer (D)', date: '01-Jan-2021' },
        { eventNumber: '1', event: 'Relapse (R)', date: '23-Jan-2023' },
        { eventNumber: '1', event: 'Disease progression (P)', date: '12-Apr-2023' },
        {
          eventNumber: '2', event: 'Disease progression (P)', date: '04-May-2023', otherClinicalScenarios: undefined,
        },
        { eventNumber: '3', event: 'Disease progression (P)', date: '29-Apr-2024' },
        { eventNumber: '4', event: 'Disease progression (P)', date: '29-Jul-2024' },
        { eventNumber: '5', event: 'Disease progression (P)', date: '15-Aug-2025' },
      ],
      pathologist: 'John Bishop',
      histologicalDiagnosis: 'Cancer',
      category1Consent: true,
      category2Consent: false,
    };
  }

  async function getPatientConsent(patientId: string): Promise<IPatientGermlineConsent> {
    return {
      category1Consent: true,
      category2Consent: true,
    };
  }

  return {
    getAccessiblePatients,
    getPatientById,
    updatePatient,
    getPatientDemographics,
    getPatientConsent,
  };
}