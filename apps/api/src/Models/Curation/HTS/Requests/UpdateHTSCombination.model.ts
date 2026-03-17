import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { combinationTypes, correlationOptions, rationaleOptions } from 'Constants/HTS/HTS.constant';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { CombinationTypes, HTSCorrelation, HTSReportingRationale } from '../HTS.model';

export interface IUpdateHTSCombination {
  screenId1?: string;
  screenId2?: string;
  combinationEffect?: CombinationTypes;
  effectCmaxScreen1?: number | null;
  effectCmaxScreen2?: number | null;
  effectCssScreen1?: number | null;
  effectCssScreen2?: number | null;
  effectCmaxCombo?: number | null;
  effectCssCombo?: number | null;
  reportable?: boolean | null;
  reportingRationale?: HTSReportingRationale | null;
  correlation?: HTSCorrelation | null;
}

export class UpdateHTSCombinationDTO {
  @IsOptional()
  @IsString()
    screenId1: string;

  @IsOptional()
  @IsString()
    screenId2: string;

  @IsOptional()
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

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsBoolean()
  @ToBoolean()
    reportable?: boolean | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsIn(rationaleOptions)
    reportingRationale?: HTSReportingRationale | null;

  @IsOptional()
  @ValidateIf((o, v) => v !== null)
  @IsIn(correlationOptions)
    correlation?: HTSCorrelation | null;
}
