import {
  IsBoolean, IsIn, IsOptional, IsString,
} from 'class-validator';
import { fileTypes } from 'Constants/FileTracker/types.constants';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { FileTypes } from '../FileTracker.model';

export interface IUploadNetappFileBody {
  sampleId?: string;
  analysisSetId?: string;
  fileName: string;
  fileType: FileTypes;
  key: string;
  isHidden?: boolean;
  bucket?: string;
}

export class UploadNetappFileDTO implements IUploadNetappFileBody {
  @IsString()
  @IsOptional()
    sampleId?: string;

  @IsString()
  @IsOptional()
    analysisSetId?: string;

  @IsString()
    fileName: string;

  @IsIn(fileTypes)
    fileType: FileTypes;

  @IsString()
    key: string;

  @IsOptional()
  @IsString()
    bucket?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHidden?: boolean;
}
