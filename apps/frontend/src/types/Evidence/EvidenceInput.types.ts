import { FileWithPath } from 'react-dropzone';
import { ICreateCitation } from './Citations.types';
import { ResourceType } from './Resources.types';

export type CitationInputErrors = {
  title?: string;
  authors?: string;
  source?: string;
  year?: string;
  externalId?: string;
};

export type FileInputErrors = {
  name?: string;
  file?: string;
};

export type UrlInputErrors = {
  name?: string;
  url?: string;
};

export type NoInputPickedError = {
  invalid?: string;
};

interface IResourceInputBase {
  name: string;
  sampleId: string;
  type: ResourceType
}

export interface IFileResourceInput extends IResourceInputBase {
  file: FileWithPath;
  ui: 'PDF' | 'IMG';
  errors?: FileInputErrors;
}

export interface IUrlResourceInput extends IResourceInputBase {
  url: string;
  ui: 'LINK';
  errors?: UrlInputErrors;
}

export interface ICitationInput extends Partial<ICreateCitation> {
  ui: 'CITATION';
  errors?: CitationInputErrors;
}

export type InitialInput = { ui: null; errors?: NoInputPickedError };

export type InputEvidence =
  | IFileResourceInput
  | IUrlResourceInput
  | ICitationInput
  | InitialInput;

export type InputResource = IFileResourceInput | IUrlResourceInput | InitialInput;
