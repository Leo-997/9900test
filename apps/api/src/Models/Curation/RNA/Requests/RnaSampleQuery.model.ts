import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import { Chromosome, SortString } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { IPromoteClassifierBody, IUpdateRNAClassifierFilters } from '../RnaSample.model';

export interface ICuratedSampleSomaticRnaQuery extends IGetReportableVariant {
  gene?: string[];
  geneExpression?: string[];
  chromosome?: string[];
  search?: string;
  foldChange?: number[];
  zScore?: number[];
  tpm?: number[];
  fpkm?: number[];
  sortColumns?: string[];
  sortDirections?: SortString[];
  defaultFilter?: boolean;
}

export interface IGetRNAByIdQuery {
  outlier?: boolean;
}

export class CuratedSampleSomaticRnaQueryDTO
  extends GetReportableVariantDTO
  implements ICuratedSampleSomaticRnaQuery {
  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    gene?: string[];

  @IsOptional()
  @Type(() => String)
  @IsIn(['Low', 'Medium', 'High', 'None', 'Unknown'], { each: true })
    geneExpression?: string[];

  @IsOptional()
  @Type(() => String)
  @IsChromosome({ each: true })
    chromosome?: Chromosome[];

  @IsOptional()
  @IsString()
    search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
    foldChange?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
    zScore?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
    tpm?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
    fpkm?: number[];

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @Type(() => String)
  @IsEnum(['asc', 'desc'], { each: true })
    sortDirections?: SortString[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    defaultFilter?: boolean;
}

interface IPaginatedSampleSomaticRnaQuery
  extends ICuratedSampleSomaticRnaQuery {
  page?: number;
  limit?: number;
}

export class PaginatedSampleSomaticRnaQueryDTO
  extends CuratedSampleSomaticRnaQueryDTO
  implements IPaginatedSampleSomaticRnaQuery {
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

export class GetRNAByIdQueryDTO implements IGetRNAByIdQuery {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    outlier?: boolean;
}

export class ClassifierDTO implements IPromoteClassifierBody {
  @IsString()
    classifier: string;

  @IsString()
    version: string;

  @IsString()
    prediction: string;

  @IsBoolean()
    selectedPrediction: boolean;
}

export class UpdateRNAClassifierFiltersDTO implements IUpdateRNAClassifierFilters {
  @IsString()
    prediction: string;
}
