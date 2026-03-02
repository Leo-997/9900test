import { Type } from 'class-transformer';
import {
  IsArray, IsNumber, IsOptional, IsString,
} from 'class-validator';

export interface IGetPatientDetailsQuery {
  biomaterialIds?: number[];
  biomaterialNames?: string[];
}

export interface IGetPatientDemographicsQuery {
  eventNumber?: number;
}

export class GetPatientDetailsQueryDTO implements IGetPatientDetailsQuery {
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
    biomaterialIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    biomaterialNames?: string[];
}

export class GetPatientDemographicsQueryDTO implements IGetPatientDemographicsQuery {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    eventNumber?: number;
}
