import { Type } from 'class-transformer';
import {
  IsInt, IsOptional, Max, Min,
} from 'class-validator';

export interface IPaginationRequest {
  page?: number;
  limit?: number;
}

export class PaginationRequestDTO implements IPaginationRequest {
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
