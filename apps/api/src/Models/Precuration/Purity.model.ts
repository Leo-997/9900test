import { IsOptional, IsString } from 'class-validator';

export interface IPurity {
  purityId: number;
  analysisSetId: string;
  purity: number;
  minPurity: number;
  maxPurity: number;
  ploidy: number;
  minPloidy: number;
  maxPloidy: number;
  msStatus: string;
  wgDuplication: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IPurityFilters {
  analysisSetId?: string;
}

export class PurityFiltersDTO implements IPurityFilters {
  @IsOptional()
  @IsString()
  analysisSetId?: string;
}
