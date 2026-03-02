import {
  IsBoolean, IsDate, IsIn, IsNumber, IsOptional, IsString,
} from 'class-validator';
import { Chromosome } from 'Models/Curation/Misc.model';
import { ReportType } from 'Models/Reports/Reports.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { VariantType, variantTypes } from 'Models/Misc/VariantType.model';
import {
  bamMethods,
  categories,
  circosTypes,
  fileTypes,
  htsTypes,
  methylationTypes,
  mutsigTypes,
  qcTypes,
  refGenomes,
  sampleTypes,
  tsvTypes,
} from 'Constants/FileTracker/types.constants';
import { reportTypes } from 'Constants/Reports/Reports.constants';
import { Type } from 'class-transformer';
import {
  CircosTypes,
  FileTypes,
  MethylationTypes,
  MutsigTypes,
  Platforms,
  PlatformDataFile,
  Categories,
  QCTypes,
  ReferenceGenomeTypes,
  SampleTypes,
  HTSTypes,
  BAMMethods,
  TSVTypes,
} from '../FileTracker.model';

interface IPostDataFileBase {
  fileName: string;
  fileType: FileTypes;
  fileSize: number;
  md5: string;
  updatedAt?: Date;
  sampleId?: string;
  patientId?: string;
  publicSampleId?: string;
  publicPatientId?: string;
  sampleType?: SampleTypes;
  refGenome?: ReferenceGenomeTypes;
  flowcellId?: string;
  lane?: number;
  isHidden?: boolean;

  category?: Categories;
  type?: CircosTypes | MutsigTypes | QCTypes | MethylationTypes | HTSTypes | ReportType | TSVTypes;
  variantType?: VariantType;
  rnaSeqId?: string;
  methSampleId?: string;
  gene?: string;
  chr?: Chromosome;
  clusterId?: string;
  genes?: string;
  htsId?: string;
  drugId?: string;
  bamMethods?: BAMMethods;
  assembly?: boolean;
  reportType?: ReportType;
  version?: string;

  startGene?: string;
  endGene?: string;
  chrBkpt1?: Chromosome;
  chrBkpt2?: Chromosome;
  posBkpt1?: number;
  posBkpt2?: number;
}

// Platform interfaces
interface IPostNetappFile extends IPostDataFileBase {
  platform: Platforms;
  key: string;
  bucket: string;
  etag: string;
  accountId?: string;
  accountName?: string;
}

interface IPostDNANexusFile extends IPostDataFileBase {
  platform: Platforms;
  dxFileId: string;
  dxProjectId: string;
  dxRegion: string;
  dxFolder: string;
  dxProject: string;
}

interface IPostNCIMDSSFile extends IPostDataFileBase {
  platform: Platforms;
  filePath: string;
  account: string;
}

export class PostDataFileBaseDTO
implements IPostDataFileBase {
  @IsString()
  fileName: string;

  @IsIn(fileTypes)
  fileType: FileTypes;

  @IsNumber()
  fileSize: number;

  @IsString()
  md5: string;

  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @IsString()
  @IsOptional()
  sampleId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  publicSampleId?: string;

  @IsOptional()
  @IsString()
  publicPatientId?: string;

  @IsOptional()
  @IsString()
  @IsIn(sampleTypes)
  sampleType?: SampleTypes;

  @IsOptional()
  @IsString()
  @IsIn(refGenomes)
  refGenome?: ReferenceGenomeTypes;

  @IsOptional()
  @IsString()
  flowcellId?: string;

  @IsOptional()
  @IsNumber()
  lane?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsIn(categories)
  category?: Categories;

  @IsOptional()
  @IsIn([
    ...circosTypes,
    ...mutsigTypes,
    ...qcTypes,
    ...methylationTypes,
    ...htsTypes,
    ...reportTypes,
    ...tsvTypes,
  ])
  type?:
    | CircosTypes
    | MutsigTypes
    | QCTypes
    | MethylationTypes
    | HTSTypes
    | ReportType
    | TSVTypes;

  @IsOptional()
  @IsIn(variantTypes)
  variantTypes?: string;

  @IsOptional()
  @IsString()
  rnaSeqId?: string;

  @IsOptional()
  @IsString()
  methSampleId?: string;

  @IsOptional()
  @IsString()
  gene?: string;

  @IsOptional()
  @IsString()
  chr?: Chromosome;

  @IsOptional()
  @IsString()
  clusterId?: string;

  @IsOptional()
  @IsString()
  genes?: string;

  @IsOptional()
  @IsString()
  htsId?: string;

  @IsOptional()
  @IsString()
  drugId?: string;

  @IsOptional()
  @IsIn(bamMethods)
  bamMethod?: BAMMethods;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  assembly?: boolean;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  startGene?: string;

  @IsOptional()
  @IsString()
  endGene?: string;

  @IsOptional()
  @IsString()
  chrBkpt1?: Chromosome;

  @IsOptional()
  @IsString()
  chrBkpt2?: Chromosome;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  posBkpt1?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  posBkpt2?: number;
}

export class PostNetappFileDTO extends PostDataFileBaseDTO
  implements IPostNetappFile {
  @IsIn(['netapp'])
  platform: Platforms;

  @IsString()
  key: string;

  @IsString()
  bucket: string;

  @IsString()
  etag: string;

  @IsOptional()
  @IsString()
  accountId?: string;

  @IsOptional()
  @IsString()
  accountName?: string;
}

export class PostDNANexusFileDTO extends PostDataFileBaseDTO
  implements IPostDNANexusFile {
  @IsIn(['dnanexus'])
  platform: Platforms;

  @IsString()
  dxFileId: string;

  @IsString()
  dxProjectId: string;

  @IsString()
  dxRegion: string;

  @IsString()
  dxFolder: string;

  @IsString()
  dxProject: string;
}

export class PostNCIMDSSFileDTO extends PostDataFileBaseDTO
  implements IPostNCIMDSSFile {
  @IsIn(['ncimdss'])
  platform: Platforms;

  @IsString()
  filePath: string;

  @IsString()
  account: string;
}

export type PostDataFileDTO =
  | PostNetappFileDTO
  | PostDNANexusFileDTO
  | PostNCIMDSSFileDTO;

export type PostDataFilesResponse = {
  filesInserted: PlatformDataFile[];
  filesRejected: {
    file: any;
    reason: string;
  }[];
}
