import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IPaginationRequest } from 'Models/Misc/Requests/PaginationDto.model';
import {
  Chromosome,
  SortString,
} from 'Models/Curation/Misc.model';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';

export interface ICuratedSampleSomaticSnvsQuery extends IGetReportableVariant {
  search?: string;
  minPathscore?: number;
  maxPathscore?: number;
  chromosome?: Array<Chromosome>;
  gene?: string[];
  classpath?: string[];
  consequence?: string[];
  vcf?: boolean;
  gnomad?: number[];
  vaf?: number[];
  reads?: number[];
  platform?: string[];
  loh?: boolean;
  biallelic?: boolean;
  sortColumns?: string[];
  sortDirections?: string[];
  defaultFilter?: boolean;
}

export class CuratedSampleSomaticSnvsQueryDTO
  extends GetReportableVariantDTO
  implements ICuratedSampleSomaticSnvsQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  minPathscore?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxPathscore?: number;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  loh?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  biallelic?: boolean;

  @IsOptional()
  @Type(() => String)
  @IsChromosome({ each: true })
  chromosome?: Array<Chromosome>;

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  gene?: string[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  classpath?: string[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  consequence?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  vcf?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(1, { each: true })
  gnomad?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(1, { each: true })
  vaf?: number[];

  @IsOptional()
  @IsString({ each: true })
  platform?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
  @Min(0, { each: true })
  reads?: number[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  sortColumns?: string[];

  @IsOptional()
  @Type(() => String)
  @IsEnum(['asc', 'desc'], { each: true })
  sortDirections?: Array<SortString>;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  unfiltered?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  defaultFilter?: boolean;
}

export interface IPaginatedSampleSomaticSnvQuery
  extends ICuratedSampleSomaticSnvsQuery,
    IPaginationRequest {}

export class PaginatedSampleSomaticSnvQueryDTO
  extends CuratedSampleSomaticSnvsQueryDTO
  implements IPaginatedSampleSomaticSnvQuery {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
