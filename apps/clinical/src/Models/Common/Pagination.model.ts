import { Type } from 'class-transformer';
import {
  IsOptional, IsNumber, Min, Max,
} from 'class-validator';

export interface IPagination {
  page?: number;
  limit?: number;
}

export class PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
    page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
    limit?: number;
}
