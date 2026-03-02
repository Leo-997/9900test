export interface IDataElement {
  questionLabel: string;
  visitName: string;
  formName: string;
  itemValue: string;
  dataFlagLabel: string | null;
  repeatSequenceNumber: number;
}

export interface IFormAssociations {
  srcEventName: string;
  srcFormName: string;
  srcItemLabel: string;
  srcRepeatSequenceNumber: number;
  associatedEventName: string;
  associatedFormName: string;
  associatedRepeatSequenceNumber: number;
}

export interface IC1Data {
  dataElements: IDataElement[];
  formsAssociations: IFormAssociations[];
}

export interface IV2ClinicalOneResp {
  length: number;
  data: IC1Data[];
}

export interface IV2ClinicalOneRequest {
  subject_number: string;
  visit_list: string[];
}
