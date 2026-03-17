import { Type } from 'class-transformer';
import {
  IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString,
  Max,
  Min,
} from 'class-validator';
import { GetReportableVariantDTO, IGetReportableVariant } from 'Models/Common/Requests/GetReportableVariant.model';
import {
  Chromosome, Inframe, Platform, SortString,
} from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IsChromosome } from 'Utilities/validators/IsChromosome.util';
import { IsInframe } from 'Utilities/validators/IsInframe.util';
import { IsPlatform } from 'Utilities/validators/IsPlatform.util';
import { IsSVType } from 'Utilities/validators/IsSVType.util';
import { SVType } from '../GermlineSvSample.model';

export interface ICuratedSampleGermlineSVQuery extends IGetReportableVariant {
  internalId?: string;
  variantId?: number;
  parentId?: string | null;
  gene?: string[];
  chromosome?: Chromosome[];
  search?: string;
  classpath?: string[];
  svType?: SVType[];
  inframe?: Inframe[];
  platform?: Platform[];
  rnaConfidence?: string[];
  sortColumns?: string[];
  sortDirections?: SortString[];
  defaultFilter?: boolean;
}

export class CuratedSampleGermlineSVQueryDTO
  extends GetReportableVariantDTO
  implements ICuratedSampleGermlineSVQuery {
  @IsOptional()
  @IsString()
    internalId?: string;

  @IsOptional()
  @IsInt({ each: true })
    variantId?: number;

  @IsOptional()
  @IsString()
    parentId?: string;

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    gene?: string[];

  @IsOptional()
  @Type(() => String)
  @IsChromosome({ each: true })
    chromosome?: Chromosome[];

  @IsOptional()
  @IsString()
    search?: string;

  @IsOptional()
  @Type(() => String)
  @IsString({ each: true })
    classpath?: string[];

  @IsOptional()
  @Type(() => String)
  @IsSVType({ each: true })
    svType?: SVType[];

  @IsOptional()
  @Type(() => String)
  @IsInframe({ each: true })
    inframe?: Inframe[];

  @IsOptional()
  @Type(() => String)
  @IsPlatform({ each: true })
    platform?: Platform[];

  @IsOptional()
  @Type(() => String)
  @IsIn(['High', 'Med', 'Low'], { each: true })
    rnaConfidence?: string[];

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

interface IPaginatedSampleGermlineSVQuery extends ICuratedSampleGermlineSVQuery {
  page?: number;
  limit?: number;
}

export class PaginatedSampleGermlineSVQueryDTO
  extends CuratedSampleGermlineSVQueryDTO
  implements IPaginatedSampleGermlineSVQuery {
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
