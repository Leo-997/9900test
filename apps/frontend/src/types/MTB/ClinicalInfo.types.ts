export type InfoType = 'Yes' | 'No' | 'Not reported';

export type ClinicalInformationField =
  | 'Genetic test results prior to enrolment'
  | 'Relevant family history'
  | 'Relevant personal history'
  | 'Other relevant clinical information';

export interface IClinicalInformation {
  value: InfoType;
  note: string;
  isHidden: boolean;
}

export type ClinicalInformationData = Record<ClinicalInformationField, IClinicalInformation>;
