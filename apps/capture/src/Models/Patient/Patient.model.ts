import { eventsOfInterest } from 'Constants/Patient.constant';
import { ISample } from '../Sample/Sample.model';

export interface IRemainingPatient {
  patientId: string;
  c1SubectId: string;
  c1NewSubectId: string;
  status: string | null;
}

export interface IPatient {
  patientId: string;
  fullName: string;
  age: number;
  gender: string;
  vitalStatus: string;
  refClinician: string;
  hospital: string;
  tumour?: ISample;
  germline?: ISample;
}

export type PatientEvent = typeof eventsOfInterest[number];

export interface IEvent {
  eventNumber: string;
  event: PatientEvent;
  date: string;
  otherClinicalScenarios?: string;
}

export interface IConfirmedDiagnosisResp {
  pathologist?: string | null;
  histologicalDiagnosis?: string | null;
}

export interface IPatientDemographics extends IConfirmedDiagnosisResp {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  treatingOncologist: string;
  site: string;
  dateOfEnrolment?: string;
  enrolmentOncologist?: string | null;
  dateOfDeath?: string | null;
  germlineConsent?: boolean | null;
  events?: IEvent[];
  category1Consent?: boolean;
  category2Consent?: boolean;
}
