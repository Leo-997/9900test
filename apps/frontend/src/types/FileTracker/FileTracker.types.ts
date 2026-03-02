import { SampleType } from '../Samples/Sample.types';

export type FileType = 'tar'
  | 'bam'
  | 'bai'
  | 'tdf'
  | 'fastq'
  | 'vcf'
  | 'gvcf'
  | 'json'
  | 'metrics'
  | 'png'
  | 'pdf'
  | 'docx'
  | 'other';

export type ReferenceGenome = 'hs38'
  | 'hg19lite'
  | 'hs37d5'
  | 'hg19'
  | 'hg38'
  | 'GRCh37'
  | 'GRCh38fullphix'
  | 'GRCh38lite'
  | 'GRCh37illumina';

export type Platform = 'dnanexus'
  | 'ncimdss'
  | 'netapp';

export interface IDataFile {
  fileId: string;
  patientId: string;
  sampleId: string;
  flowcellId: string;
  lane: string;
  refGenome: ReferenceGenome;
  sampleType: SampleType;
  fileName: string;
  fileType: FileType;
  md5: string;
  fileSize: number;
  platform: Platform;
  secondaryFiles?: IDataFile[];
  collections?: IDataFile[];
  updatedAt: Date;
}

export interface IDownloadURL {
  fileId: string;
  fileName: string;
  url: string;
  expiry?: string;
}

export interface ISignatureFile {
  fileId: string;
  fileName: string;
  md5: string;
  key: string;
  bucket: string;
  etag: string;
  userId: string;
  width: number;
  height: number;
  url?: string;
  blob?: Blob;
  buffer?: Buffer | ArrayBuffer;
}

export interface IPostDataFileBase {
  fileName: string;
  fileType: FileType;
  fileSize: number;
  md5: string;
  sampleId: string;
  isHidden?: boolean;
}

export interface IUploadNetappFileBody {
  sampleId?: string;
  analysisSetId?: string;
  fileName: string;
  fileType: FileType;
  key: string;
  bucket?: string;
  isHidden?: boolean;
}
