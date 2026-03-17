import { FileWithPath } from 'react-dropzone';
import { FileType } from '../FileTracker/FileTracker.types';

export type ResourceType = 'PDF' | 'LINK' | 'IMG';

export interface IResource {
  id: string;
  name: string;
  type: ResourceType;
  url?: string;
  fileId?: string;
}

export interface IResourceWithMeta extends IResource {
  clinicalSummary?: string;
  evidenceLevels?: string[];
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface ICreateResource {
  name: string;
  type: ResourceType;
  url?: string;
  fileId?: string;
  file?: FileWithPath;
}

export interface IUploadResource {
  analysisSetId: string;
  filename: string;
  fileType: FileType;
}

export interface IResourceFilters extends Partial<Omit<IResourceWithMeta, 'id'>> {
  ids?: string[];
  searchQuery?: string;
}

export interface IUpdateResourceBody {
  name?: string;
}
