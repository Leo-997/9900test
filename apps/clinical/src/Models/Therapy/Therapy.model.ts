import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { CreateTherapyDrugDTO, ICreateTherapyDrug, IFetchTherapyDrug } from '../Drug/Drug.model';
import { CreateTherapyTrial, CreateTherapyTrialDTO, IFetchTherapyTrial } from '../Trial/Trial.model';

export interface ITherapyBase {
  id: string;
  chemotherapy: boolean;
  chemotherapyNote?: string;
  radiotherapy: boolean;
  radiotherapyNote?: string;
}

export interface ITherapy extends ITherapyBase {
  trials: IFetchTherapyTrial[];
  drugs: IFetchTherapyDrug[];
}

export interface ICreateTherapy extends Omit<ITherapy, 'id' | 'drugs' | 'trials'> {
  drugs: ICreateTherapyDrug[];
  trials: CreateTherapyTrial[];
}

export class CreateTherapyDTO implements ICreateTherapy {
  @IsBoolean()
  @ToBoolean()
    chemotherapy: boolean;

  @IsOptional()
  @IsString()
    chemotherapyNote?: string;

  @IsBoolean()
  @ToBoolean()
    radiotherapy: boolean;

  @IsOptional()
  @IsString()
    radiotherapyNote?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTherapyDrugDTO)
    drugs: CreateTherapyDrugDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTherapyTrialDTO)
    trials: CreateTherapyTrial[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    evidence?: string[];
}

export class UpdateTherapyDTO implements Partial<ICreateTherapy> {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    chemotherapy?: boolean;

  @IsOptional()
  @IsString()
    chemotherapyNote?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    radiotherapy?: boolean;

  @IsOptional()
  @IsString()
    radiotherapyNote?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTherapyDrugDTO)
    drugs?: CreateTherapyDrugDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTherapyTrialDTO)
    trials?: CreateTherapyTrial[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    evidence?: string[];
}

export interface IMatchingTherapiesQuery {
  chemotherapy?: boolean;
  radiotherapy?: boolean;
  combination: string[];
}

export class MatchingTherapiesQueryDTO implements IMatchingTherapiesQuery {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    chemotherapy: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    radiotherapy: boolean;

  /**
   * This will be passed with the following format
   * [
   *   'class-id-1|drug-id-1',
   *   'class-id-2|drug-id-2',
   *   'class-id-3',
   * ]
   * This is because get requests don't support complex object arrays
  */
  @IsString({ each: true })
  @ArrayNotEmpty()
    combination: string[];
}
