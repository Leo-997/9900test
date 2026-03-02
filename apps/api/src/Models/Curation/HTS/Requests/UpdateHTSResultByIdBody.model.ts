import {
  IsBoolean, IsIn, IsOptional, IsString, ValidateIf,
} from 'class-validator';
import { correlationOptions, rationaleOptions } from 'Constants/HTS/HTS.constant';
import { Classification } from 'Models/Curation/Misc.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { HTSCorrelation, HTSReportingRationale } from '../HTS.model';

export interface IUpdateHTSResultByIdBody {
  reportTargets?: string | null;
  hit?: boolean | null;
  reportable?: boolean | null;
  reportingRationale?: HTSReportingRationale | null;
  correlation?: HTSCorrelation | null;
}

export interface IUpdateHTSByIdBody {
  comments: string;
}

export class UpdateHTSResultByIdBodyDTO implements IUpdateHTSResultByIdBody {
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.hit !== null)
    reportTargets: string | null;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ValidateIf((o) => o.hit !== null)
    hit?: boolean | null;

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

export class UpdateHTSByIdBodyDTO implements IUpdateHTSByIdBody {
  @IsOptional()
  @IsString()
    comments: Classification;
}
