import { Type } from 'class-transformer';
import {
  IsInt,
  IsBoolean,
  IsOptional,
  IsString,
  Max,
  Min,
  IsEnum,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNumber,
} from 'class-validator';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import { Chromosome, Importance, SortString } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';

export interface ICuratedSampleGermlineCnvQuery extends IGetReportableVariant {
  isLOH?: boolean;
  cn?: number[];
  cnType?: string[];
  chromosome?: Chromosome[];
  gene?: string[];
  search?: string;
  classpath?: string[];
  importance?: Importance[];
  sortColumns?: string[];
  sortDirections?: SortString[];
}

export class CuratedSampleGermlineCnvQueryDTO
  extends GetReportableVariantDTO
  implements ICuratedSampleGermlineCnvQuery {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  isLOH?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
  @Min(0, { each: true })
  cn?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cnType?: string[];

  @IsOptional()
  @Type(() => String)
  @IsChromosome({ each: true })
  chromosome?: Chromosome[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  gene?: string[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  classpath?: string[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  importance?: Importance[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
  sortColumns?: string[];

  @IsOptional()
  @Type(() => String)
  @IsEnum(['asc', 'desc'], { each: true })
  sortDirections?: SortString[];
}

interface IPaginatedSampleGermlineCnvQuery
  extends ICuratedSampleGermlineCnvQuery {
  page?: number;
  limit?: number;
}

export class PaginatedSampleGermlineCnvQueryDTO
  extends CuratedSampleGermlineCnvQueryDTO
  implements IPaginatedSampleGermlineCnvQuery {
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
