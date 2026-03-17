import {
  biosampleSources, biosampleStatuses, biosampleTypes, sampleTypes, specimens, specimenStates,
} from '@/constants/sample';

export type SampleType = typeof sampleTypes[number];
export type BiosampleStatuses = typeof biosampleStatuses[number];
export type BiosampleType = typeof biosampleTypes[number];
export type BiosampleSource = typeof biosampleSources[number];
export type Specimen = typeof specimens[number];
export type SpecimenState = typeof specimenStates[number];

export interface IAlias {
  biosampleId: string;
  alias: string;
  aliasType: string;
}

export interface IBiosample {
  biosampleId: string;
  patientId: string;
  publicSubjectId: number;
  zccSampleId: string;
  lmSubjId: string;
  manifestId: number;
  manifestName: string;
  providerId: string;
  platformId: number;
  sampleType: SampleType;
  biosampleStatus: BiosampleStatuses;
  biosampleType: BiosampleType;
  biosampleSource: BiosampleSource;
  biomaterialId: number;
  ancestorBiomaterial: number;
  biomaterialName: string;
  specimen: Specimen;
  specimenState: SpecimenState;
  ageAtSample: string;
  collectionDate: string;
  processingDate: string;
  sequencingDate: string;
  sampleOriginType: string;
  published: string;
  stage: string;
  status: string;
  aliases: IAlias[];
}

export interface IBiosampleFilters {
  patientId?: string;
  analysisSetId?: string;
  search?: string[];
  sampleTypes?: SampleType[];
}

export interface IPipeline {
  pipelineId: string;
  biosampleId: string;
  pipelineName: string;
  pipelineVersion: string;
  runDate: Date;
  taskId: string;
  taskStatus: string;
}

export interface IPipelinesFilters {
  name?: string;
  biosamples?: string[];
}
