import { htsHitsTypes } from 'Constants/FileTracker/types.constants';
import { HTSHitsTypes } from 'Models/FileTracker/FileTracker.model';
import { IsIn, IsOptional } from 'class-validator';

export interface IGetHTHitsPlotsFilters {
  plot: HTSHitsTypes;
}

export class GetHTHitsPlotsFiltersDTO implements IGetHTHitsPlotsFilters {
  @IsOptional()
  @IsIn(htsHitsTypes)
  plot: HTSHitsTypes;
}
