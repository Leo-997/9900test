import {
    IsDateString, IsIn, IsString, ValidateIf,
} from 'class-validator';
import { meetingTypes } from 'Constants/Meetings/Meetings.contant';
import { PaginationDTO } from '../Common/Pagination.model';

export type MeetingType = typeof meetingTypes[number];

export interface IClinicalMeeting {
  date: Date | null;
  type: MeetingType;
  chairId: string | null;
}

export type IUpdateMeetingDateBody = Pick<IClinicalMeeting, 'date' | 'type'>

export type IUpdateMeetingChairBody = Pick<IClinicalMeeting, 'chairId' | 'type'>

export interface IUpdateMeetingDashboardChairBody {
  chairId: string | null;
  date: string | null;
}

export interface IAssignMultipleMeetingsBody {
  clinicalVersions: string[];
  date: Date;
  type: MeetingType;
}

export interface IUpdateSampleChair {
  clinicalVersionId: string;
  type: MeetingType;
}

export class UpdateMeetingDateBodyDTO
implements IUpdateMeetingDateBody {
  @IsDateString()
  @ValidateIf((o, v) => v !== null)
    date: Date | null;

  @IsIn(meetingTypes)
    type: MeetingType;
}

export class UpdateMeetingChairBodyDTO
implements IUpdateMeetingChairBody {
  @IsString()
  @ValidateIf((o, v) => v !== null)
    chairId: string | null;

  @IsIn(meetingTypes)
    type: MeetingType;
}

export class UpdateMeetingDashboardChairBodyDTO
implements IUpdateMeetingDashboardChairBody {
  @IsString()
  @ValidateIf((o, v) => v !== null)
    chairId: string | null;

  @IsDateString()
  @ValidateIf((o, v) => v !== null)
    date: string | null;
}

export class AssignMultipleMeetingsBodyDTO
implements IAssignMultipleMeetingsBody {
  @IsString({ each: true })
    clinicalVersions: string[];

  @IsDateString()
    date: Date;

  @IsIn(meetingTypes)
    type: MeetingType;
}

export class FetchSamplesDTO
  extends PaginationDTO {
  @IsDateString()
  @ValidateIf((o, v) => v !== null)
    date: string | null;
}

export class DateQueryDTO {
  @IsDateString()
    date: string;
}
