import { Type } from 'class-transformer';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsNumber,
  ArrayNotEmpty,
} from 'class-validator';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import {
  Chromosome,
  SortString,
} from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';

export interface ICuratedSampleGermlineSnvsQuery extends IGetReportableVariant {
  search?: string;
  variantIds?: string[];
  minPathscore?: number;
  maxPathscore?: number;
  chromosome?: Chromosome[];
  gene: string[];
  classpath?: string[];
  consequence?: string[];
  vcf?: boolean;
  gnomad?: number[];
  vaf?: number[];
  reads?: number[];
  loh?: boolean;
  biallelic?: boolean;
  sortColumns?: string[];
  sortDirections?: SortString[];
  defaultFilter?: boolean;
}

export class CuratedSampleGermlineSnvsQueryDTO
  extends GetReportableVariantDTO
  implements ICuratedSampleGermlineSnvsQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  variantIds?: string[];

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
  @IsBoolean()
  @ToBoolean()
  unfiltered?: boolean;

  @IsOptional()
  @Type(() => String)
  @IsChromosome({ each: true })
  chromosome?: Chromosome[];

  @Type(() => String)
  @IsString({ each: true })
  @ArrayNotEmpty()
  gene: string[];

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
  defaultFilter?: boolean;
}

interface IPaginatedSampleGermlineSnvQuery
  extends ICuratedSampleGermlineSnvsQuery {
  page?: number;
  limit?: number;
}

export class PaginatedSampleGermlineSnvQueryDTO
  extends CuratedSampleGermlineSnvsQueryDTO
  implements IPaginatedSampleGermlineSnvQuery {
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
