export type TissueType = 'Germline' | 'Tumour';

export interface ISample {
  patientId: string;
  sampleId: string;
  event: string;
  biomaterialId: string;
  biomaterialName: string;
  sampleType: string;
  tissueType: TissueType;
  germline?: ISample;
}
