export type SampleLinks = {
  biosampleId: string;
  name: string;
  pathUrl: string;
  indexUrl: string;
  coverageUrl?: string;
}

export type SampleData = {
  tumour: string;
  normal: string;
}

export type SampleResponse = {
  links: SampleLinks[];
  invalidSamples: string[];
}

export type Experiment = 'wgs' | 'rna';

export interface ISampleRequest {
  sampleIds: string[];
}
