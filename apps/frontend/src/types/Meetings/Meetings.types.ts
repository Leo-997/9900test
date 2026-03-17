import { clinicalMeetingTypes } from '../../constants/Meetings/meetings';

export type ClinicalMeetingType = typeof clinicalMeetingTypes[number];

export interface IClinicalMeeting {
  type: ClinicalMeetingType;
  date: string | null;
  chairId: string | null;
}

export type IUpdateClinicalMeetingDateBody = Pick<IClinicalMeeting, 'date' | 'type'>

export type IUpdateClinicalMeetingChairBody = Pick<IClinicalMeeting, 'chairId' | 'type'>

export interface IUpdateClinicalMeetingDashboardChairBody {
  date: string | null;
  chairId: string | null;
}

export interface IAssignMultipleClinicalMeetingsBody {
  clinicalVersions: string[];
  date: string;
  type: ClinicalMeetingType;
}
