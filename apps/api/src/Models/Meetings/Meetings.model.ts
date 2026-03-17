import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IAnalysisSet } from 'Models/Analysis/AnalysisSets.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';

export interface IMeeting {
  meetingId: string;
  date: string;
  analysisSets?: IAnalysisSet[];
}

export interface IMeetingUpdateBody {
  analysisSets: string[];
  date: string | null;
}

export interface IGetMeetingsFilters {
  date?: string;
  window?: 'month' | 'day';
  includeAnalysisSets?: boolean;
}

export class MeetingUpdateBodyDTO implements IMeetingUpdateBody {
  @IsOptional()
  @IsString({ each: true })
  @ValidateIf((object, value) => value !== null)
  analysisSets: string[];

  @IsOptional()
  @IsDateString()
  @ValidateIf((object, value) => value !== null)
  date: string | null;
}

export class GetMeetingsFilters implements IGetMeetingsFilters {
  @IsOptional()
  @IsDateString()
  @ValidateIf((object, value) => value !== null)
  date: string | null;

  @IsOptional()
  @IsIn(['day', 'month'])
  @ValidateIf((object, value) => value !== null)
  window?: 'month' | 'day';

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  includeAnalysisSets?: boolean;
}
