import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class PaginationDTO {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @Field(() => Int, { nullable: true })
    page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @Field(() => Int, { nullable: true })
    limit?: number;
}
