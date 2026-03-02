import { Type } from 'class-transformer';
import { IsOptional, IsNumber, Min } from 'class-validator';

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
