import { eventsOfInterest } from '../../constants/patient';

export interface IPatient {
  patientId: string;
  zccSubjectId: string;
  internalId: string;
  labmatrixId: string;
  labmatrixCode: string;
  sex: 'Male' | 'Female' | 'Multi' | 'Unknown';
  germlineAberration: string;
  ageAtDiagnosis: number;
  ageAtDeath: number;
  ageAtEnrolment: number | null;
  vitalStatus: 'Alive' | 'Dead' | 'Unknown';
  hospital: string;
  enrolmentDate: Date;
  registrationDate?: Date;
  clinicalHistory: string;
  status: string | null;
  stage: string | null;
  comments: string;
  consanguinityScore: number | null;
}

export type PatientEvent = typeof eventsOfInterest[number];

export interface IEvent {
  eventNumber: string;
  event: PatientEvent;
  date: string;
  otherClinicalScenarios?: string;
}

export interface IPatientGermlineConsent {
  germlineConsent?: boolean | null;
  category1Consent?: boolean;
  category2Consent?: boolean;
}

export interface IPatientDemographics extends IPatientGermlineConsent {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  treatingOncologist: string;
  site: string;
  events?: IEvent[];
  age?: number;
  dateOfEnrolment?: string;
  enrolmentOncologist?: string | null;
  dateOfDeath?: string | null;
  pathologist?: string | null;
  histologicalDiagnosis?: string | null;
}

export interface IPatientDetails extends IPatientDemographics {
  patientId: string;
  sex: string;
  vitalStatus: string;
  hospital: string;
  ageAtDiagnosis: string;
  ageAtDeath: string | null;
  enrolmentDate: string;
}

export interface IAccessiblePatient {
  patientId: string;
  analysisSetId?: string;
  biosampleId?: string;
  isReadOnly: boolean;
  isFullCaseAccess: boolean;
}

export interface IAccessiblePatientQuery {
  patientId?: string;
  analysisSetId?: string;
  biosampleId?: string;
}
