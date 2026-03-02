export interface IClinicalDataDetailsResponse {
  patientId: string;
  fullName: string;
  age: number;
  gender: string;
  vitalStatus: string;
  refClinician: string;
  hospital: string;
  tumour?: IClinicalDataSample;
  germline?: IClinicalDataSample;
}

export interface IClinicalDataSample {
  patientId: string;
  sampleId: string;
  event: string;
  biomaterialId: string;
  biomaterialName: string;
  sampleType: string;
  tissueType: TissueType;
  germline?: IClinicalDataSample;
}

export interface IClinicalPatientDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  treatingOncologist: string;
  site: string;
  age?: number;
  dateOfEnrolment?: string;
  enrolmentOncologist?: string | null;
  dateOfDeath?: string | null;
  germlineConsent?: boolean | null;
  pathologist?: string | null;
}

export type TissueType = "Germline" | "Tumour";
