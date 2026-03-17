import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDefined,
    IsIn,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';

export type FileType =
  | 'tar'
  | 'bam'
  | 'bai'
  | 'tdf'
  | 'fastq'
  | 'vcf'
  | 'gvcf'
  | 'json'
  | 'metrics'
  | 'png'
  | 'jpg'
  | 'pdf'
  | 'other'
  | 'html';

export interface ISlideAttachmentBase {
  slideId: string;
  fileId: string;
  sectionId?: string;
  title: string;
  caption?: string;
  fileType: FileType;
  width: number;
  order: number;
  isAtBottom: boolean;
  isCondensed: boolean;
}

export type CreateSlideAttachmentBody = Omit<ISlideAttachmentBase, 'slideId' | 'order' | 'isCondensed' | 'isAtBottom'>;

export class CreateSlideAttachmentDTO implements CreateSlideAttachmentBody {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
    fileId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
    sectionId?: string;

  @IsDefined()
  @IsIn([
    'tar',
    'bam',
    'bai',
    'fastq',
    'vcf',
    'gvcf',
    'json',
    'metrics',
    'png',
    'jpg',
    'pdf',
    'html',
    'other',
    ])
    fileType: FileType;

  @IsNotEmpty()
  @IsString()
    title: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
    caption?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(2)
  @Max(12)
    width: number;
}

export type UpdateSlideAttachmentSettingsBody = Pick<ISlideAttachmentBase, 'width' | 'isCondensed' | 'isAtBottom'>;

export class UpdateSlideAttachmentSettingsDTO implements UpdateSlideAttachmentSettingsBody {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(2)
  @Max(12)
    width: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isCondensed: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isAtBottom: boolean;
}

export type UpdateSlideAttachmentDetailsBody = Pick<ISlideAttachmentBase, 'title' | 'caption'>;

export class UpdateSlideAttachmentDetailsDTO implements UpdateSlideAttachmentDetailsBody {
  @IsString()
  @IsNotEmpty()
    title: string;

  @IsOptional()
  @IsString()
    caption?: string;
}

export interface IUpdateSlideAttachmentOrderBody {
  id: string;
  order: number;
}

export class SlideAttachmentOrderDTO implements IUpdateSlideAttachmentOrderBody {
  @IsString()
    id: string;

  @IsNumber()
  @Type(() => Number)
    order: number;
}

export class UpdateSlideAttachmentOrderDTO {
  @ValidateNested({ each: true })
  @Type(() => SlideAttachmentOrderDTO)
    orders: SlideAttachmentOrderDTO[];
}

export interface IAddFileResponse {
  fileId: string;
  slideId: string;
}
