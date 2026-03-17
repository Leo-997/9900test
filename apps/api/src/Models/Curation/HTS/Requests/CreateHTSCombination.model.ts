import { Type } from 'class-transformer';
import {
  IsIn, IsNumber, IsOptional, IsString,
  ValidateIf,
} from 'class-validator';
import { combinationTypes } from 'Constants/HTS/HTS.constant';
import { CombinationTypes } from '../HTS.model';

export interface ICreateHTSCombination {
  screenId1: string;
  screenId2: string;
  combinationEffect: CombinationTypes;
  effectCmaxScreen1?: number | null;
  effectCmaxScreen2?: number | null;
  effectCssScreen1?: number | null;
  effectCssScreen2?: number | null;
  effectCmaxCombo?: number | null;
  effectCssCombo?: number | null;
}

export class CreateHTSCombinationDTO implements ICreateHTSCombination {
  @IsString()
    screenId1: string;

  @IsString()
    screenId2: string;

  @IsIn(combinationTypes)
    combinationEffect: CombinationTypes;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCmaxScreen1?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCmaxScreen2?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCssScreen1?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCssScreen2?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCmaxCombo?: number | null;

  @ValidateIf((o, v) => v !== null)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    effectCssCombo?: number | null;
}
