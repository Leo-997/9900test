import {
  IsArray, IsIn, IsOptional, IsString,
} from 'class-validator';
import {
  biosampleSources,
  biosampleStatuses,
  biosampleTypes,
  sampleTypes,
  specimens,
  specimenStates,
} from 'Constants/Analysis/Biosamples.constant';
import { IPaginationRequest, PaginationRequestDTO } from 'Models/Misc/Requests/PaginationDto.model';

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
  biosampleUUID: string;
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

export interface IPipeline {
  pipelineId: string;
  biosampleId: string;
  pipelineName: string;
  pipelineVersion: string;
  runDate: Date;
  taskId: string;
  taskStatus: string;
}

export interface IBiosampleFilters extends IPaginationRequest {
  patientId?: string;
  analysisSetId?: string;
  search?: string[];
  sampleTypes?: SampleType[];
}

export interface IPipelinesFilters extends IPaginationRequest {
  name?: string;
  biosamples?: string[];
}

export class BiosamplesFiltersDTO extends PaginationRequestDTO implements IBiosampleFilters {
  @IsOptional()
  @IsString()
    patientId?: string;

  @IsOptional()
  @IsString()
    analysisSetId?: string;

  @IsOptional()
  @IsString({ each: true })
    search?: string[];

  @IsOptional()
  @IsArray()
  @IsIn(sampleTypes, { each: true })
    sampleTypes?: SampleType[];
}

export class PipelineFiltersDTO extends PaginationRequestDTO implements IPipelinesFilters {
  @IsOptional()
  @IsString()
    name?: string;

  @IsOptional()
  @IsString({ each: true })
    biosamples?: string[];
}
