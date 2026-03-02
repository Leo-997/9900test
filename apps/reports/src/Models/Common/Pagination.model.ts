import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

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
  @Type(() => Number)
    limit?: number;
}
