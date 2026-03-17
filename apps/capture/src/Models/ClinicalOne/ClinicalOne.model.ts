/* eslint-disable @typescript-eslint/naming-convention */
export interface IOption {
  label: string;
  value: string;
}

export interface IDemographicsForm {
  'First Name': string;
  'Last Name': string;
  'Age_SMARTITEM_02_DOB': string;
  'Enrolling oncologist': IOption[];
  'Enrolling Oncologist is unlisted, please specify here': string;
  'Current treating oncologist': IOption[];
  'Current treating Oncologist is unlisted, please specify here': string;
  'Treating Hospital at registration': IOption[];
  'Other specify': string;
}

export interface IPatientEventsForm {
  'Patient Event'?: IOption[];
  'Patient Event :'?: IOption[];
  'Event number': IOption[];
  'Event date': string;
}

export interface ISubjectConsentForm {
  'Consent to the disclosure of Germline findings': IOption[];
  'Consent Type': IOption[];
  'Withdrawal from (please tick all that apply)': IOption[];
}

export interface ISampleSubmissionForm {
  'Speciment Purpose': string;
  'associatedForms': string;
}

export interface ISampleSubmissionDemographicsForm {
  'Histologic Diagnosis': string;
}

export interface ITumourSampleForm {
  'Pathologist distributing specimen': string;
  'Pathologist distributing specimen is unlisted, please specify name': string;
}

export interface IConfirmedDiagnosisForm {
  'Reporting pathologist': IOption[];
  'Reporting pathologist is unlisted, please enter name': string;
  'Pre-molecular histology or immunophenotype-based diagnosis': IOption[] | null;
  'Unlisted, please specify': string | null;
  associatedForms: string[];
}

export interface IContactDetailsForm {
  'Treating Clinician': IOption[];
  'Enter Treating Clinician name, if not in drop down': string;
  'Treating Hospital': IOption[];
  'Other Hospital, specify': string;
}

export interface ISubjectRegistration {
  'Patient Demographics': {
    [key in string]: IDemographicsForm;
  };
}

export interface IPatientEvents {
  'Patient Events': {
    [key in string]: IPatientEventsForm;
  }
}

export interface ISubjectConsent {
  'Consent': {
    [key in string]: ISubjectConsentForm;
  }
}

export interface ISampleSubmission {
  'Sample Submission': {
    [key in string]: ISampleSubmissionForm;
  };
  'Patient Demographics for Sample Submission': {
    [key in string]: ISampleSubmissionDemographicsForm;
  };
  'Tumour Sample': {
    [key in string]: ITumourSampleForm;
  },
}

export interface IConfirmedDiagnosis {
  'Confirmed Diagnosis and Risk': {
    [key in string]: IConfirmedDiagnosisForm;
  };
  'Confirmation of Diagnosis and Risk - entered by Oncologist': {
    [key in string]: IConfirmedDiagnosisForm;
  };
}

export interface ILog {
  'Contact Details': {
    [key in string]: IContactDetailsForm;
  }
}

export type ClinicalOneFormType = IPatientEvents
  | ISubjectRegistration
  | ISubjectConsent
  | ISampleSubmission
  | IConfirmedDiagnosis
  | ILog;

export interface IClinicalOneResp<
  T = ClinicalOneFormType
> {
  id: string,
  content: {
    subjectNumber: string;
    visitStatus: string;
    visitDate: string,
    forms: T;
  }[];
}

export interface IClinicalOneFromDataRequest {
  patient: string,
  eventRequest: string,
  mode?: string;
  version?: string;
}
