import {
  bamMethods,
  categories,
  circosTypes,
  fileTypes,
  htsCultureTypes,
  htsHitsTypes,
  htsTypes,
  methylationTypes,
  mutsigTypes,
  platforms,
  qcTypes,
  refGenomes,
  sampleTypes,
  tsvTypes,
} from 'Constants/FileTracker/types.constants';

export interface IDownloadURL {
  fileId: string;
  fileName: string;
  url: string;
}

export type FileTypes = typeof fileTypes[number];
export type SampleTypes = typeof sampleTypes[number];
export type ReferenceGenomeTypes = typeof refGenomes[number];
export type Platforms = typeof platforms[number];
export type Categories = typeof categories[number];
export type CircosTypes = typeof circosTypes[number];
export type MutsigTypes = typeof mutsigTypes[number];
export type QCTypes = typeof qcTypes[number];
export type MethylationTypes = typeof methylationTypes[number];
export type HTSTypes = typeof htsTypes[number];
export type HTSCultureTypes = typeof htsCultureTypes[number];
export type HTSHitsTypes = typeof htsHitsTypes[number];
export type BAMMethods = typeof bamMethods[number];
export type TSVTypes = typeof tsvTypes[number];

export interface IDataFile {
  fileId: string;
  patientId: string;
  sampleId: string;
  publicSampleId: string;
  publicPatientId: string;
  refGenome: ReferenceGenomeTypes;
  sampleType: SampleTypes;
  fileName: string;
  fileType: FileTypes;
  md5: string;
  fileSize: number;
  platform: Platforms;
  updatedAt: Date;
  flowcellId?: string;
  lane?: number;
  isHidden: boolean;
  secondaryFiles?: IDataFile[];
  collections?: IDataFile[];
}

export interface INetappFile extends IDataFile {
  key: string;
  bucket: string;
  etag: string;
  accountId?: string;
  accountName?: string;
}

export interface IDNANexusFile extends IDataFile {
  dxFileId: string;
  dxProjectId: string;
  dxRegion: string;
  dxFolder: string;
  dxProject: string;
}

export interface INCIMDSSFile extends IDataFile {
  filePath: string;
  account: string;
}

export type PlatformDataFile = INetappFile | IDNANexusFile | INCIMDSSFile;

export interface IDataFileRaw extends Omit<IDataFile, 'collections' | 'secondaryFiles'> {
  collections: string;
  secondaryFiles: string;
}

export interface ISignatureFile {
  fileId: string;
  fileName: string;
  md5: string;
  key: string;
  bucket: string;
  etag: string;
  userId: string;
  width?: number;
  height?: number;
  url?: string;
}

export type InsertFileRetunType = {
  fileId: string | null;
  error: string | null;
}
