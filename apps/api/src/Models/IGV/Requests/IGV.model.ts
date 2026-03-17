import {
  IsString,
} from 'class-validator';

export type SampleLinks = {
  biosampleId: string;
  name: string;
  pathUrl: string;
  indexUrl: string;
  coverageUrl?: string;
}

export type Experiment = 'wgs' | 'rna';

export interface SampleResponse {
  links: SampleLinks[];
  invalidSamples: string[];
}

export interface IIGVFilter {
  sampleIds: string[];
}

export class IGVFilterDTO implements IIGVFilter {
  @IsString({ each: true })
  public sampleIds: string[];
}
