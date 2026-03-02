import { IsString, IsNumber } from 'class-validator';

export type SortString = 'asc' | 'desc';

export class UpdateOrderDTO {
  @IsString()
    id: string;

  @IsNumber()
    order: number;
}
