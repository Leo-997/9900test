import { htsSortColumns } from 'Constants/HTS/HTS.constant';
import { SortString } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt, IsOptional, IsString, Max, Min,
} from 'class-validator';

export type HTSSortColumns = typeof htsSortColumns[number];

export interface IGetHTSResultQuery {
  screenIds?: string[];
  hit?: boolean;
  reportable?: boolean;
  sortColumns?: HTSSortColumns[];
  sortDirections?: SortString[];
}

export class PaginatedHTSResultQuery {
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

export class GetHTSResultQueryDTO extends PaginatedHTSResultQuery implements IGetHTSResultQuery {
  @IsOptional()
  @IsString({ each: true })
    screenIds?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    hit?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    reportable?: boolean;

  @IsOptional()
  @IsIn(htsSortColumns, { each: true })
    sortColumns?: HTSSortColumns[];

  @IsOptional()
  @IsIn(['asc', 'desc'], { each: true })
    sortDirections?: SortString[];
}

export interface IGetHTSCombinationsQuery {
  screenIds?: string[]
  hit?: boolean;
  reportable?: boolean;
}

export class GetHTSCombinationsQueryDTO {
  @IsOptional()
  @IsString({ each: true })
    screenIds?: string[];

    @IsOptional()
    @IsBoolean()
    @ToBoolean()
      hit?: boolean;

    @IsOptional()
    @IsBoolean()
    @ToBoolean()
      reportable?: boolean;
}
