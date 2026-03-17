import { Type } from 'class-transformer';
import {
  IsInt, IsOptional, IsString, Max, Min,
} from 'class-validator';
import {
  PaginationRequestDTO,
} from 'Models/Misc/Requests/PaginationDto.model';

export interface IGetRnaPathwaysQuery {
  search?: string;
}

interface IPaginatedRnaPathwaysQuery
  extends IGetRnaPathwaysQuery {
  page?: number;
  limit?: number;
}

export class GetRnaPathwaysQueryDTO
  extends PaginationRequestDTO
  implements IPaginatedRnaPathwaysQuery {
  @IsOptional()
  @IsString()
    search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  declare page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  declare limit?: number;
}
