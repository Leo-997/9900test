import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { PaginationRequestDTO } from 'Models/Misc/Requests/PaginationDto.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  FileTypes, Platforms, ReferenceGenomeTypes, SampleTypes,
} from '../FileTracker.model';

export interface IFileTrackerFilter {
  search?: string[];
  fileType?: FileTypes[];
  sampleType?: SampleTypes[];
  refGenome?: ReferenceGenomeTypes[];
  platform?: Platforms[];
  fileSize?: number[];
  isHidden?: boolean;
  sortColumns?: string[];
  sortDirections?: string[];
}

export class FileTrackerFilterDTO
  extends PaginationRequestDTO
  implements IFileTrackerFilter {
  @IsOptional()
  @IsString({ each: true })
    search?: string[];

  @IsOptional()
  @IsString({ each: true })
    fileType?: FileTypes[];

  @IsOptional()
  @IsString({ each: true })
    sampleType?: SampleTypes[];

  @IsOptional()
  @IsString({ each: true })
    refGenome?: ReferenceGenomeTypes[];

  @IsOptional()
  @IsString({ each: true })
    platform?: Platforms[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
  @Min(0, { each: true })
    fileSize?: number[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHidden?: boolean;

  @IsOptional()
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @IsString({ each: true })
    sortDirections?: string[];
}

export interface INetappFileFilter {
  key: string;
  bucket?: string;
}

export class NetappFileFilterDTO
implements INetappFileFilter {
  @IsString()
    key: string;

  @IsOptional()
  @IsString()
    bucket?: string;
}

export interface IDNANexusFileFilter {
  dxFileId: string;
  dxProjectId: string;
}

export class DNANexusFileFilterDTO
implements IDNANexusFileFilter {
  @IsString()
    dxFileId: string;

  @IsString()
    dxProjectId: string;
}

export interface IPostNCIMDSSFileFilter {
  filePath: string;
  account?: string;
}

export class NCIMDSSFileFilterDTO
implements IPostNCIMDSSFileFilter {
  @IsString()
    filePath: string;

  @IsOptional()
  @IsString()
    account?: string;
}

export class GenerateDownloadUrlsDTO {
  @IsString({ each: true })
    files: string[];
}

export interface IStreamS3URLQuery {
  url: string;
}

export class StreamS3URLQueryDTO implements IStreamS3URLQuery {
  @IsString()
    url: string;
}
