import { clinicalStatuses, pseudoStatuses } from 'Constants/ClinicalVersion/ClinicalVersion.constant';
import { Group } from '../Group/Group.model';
import { IClinicalMeeting } from '../Meetings/Meetings.model';
import { ISlideTableSettings, ReviewStatus } from '../Sample/Sample.model';

export type ClinicalVersionStatus = typeof clinicalStatuses[number];
export type PseudoStatus = typeof pseudoStatuses[number];
export interface IReviewerData {
  reviewerId: string;
  status: ReviewStatus;
  group: Group;
}

export interface IClinicalVersion {
  id: string;
  version: number;
  analysisSetId: string;
  patientId: string;
  status: ClinicalVersionStatus;
  pseudoStatus: PseudoStatus | null;
  patientAgeAtDeath: string | null;
  vitalStatus: string;
  clinicalHistory: string;
  frequencyUnits: string;
  cohort: string;
  histologicalDiagnosis: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  meetings: IClinicalMeeting[];
  curatorId: string | null;
  clinicianId: string | null;
  cancerGeneticistId: string | null;
  reviewerIds: IReviewerData[] | null;
  discussionTitle: string | null;
  discussionNote: string | null;
  discussionColumns: number;
  presentationModeScale: number;
  slideTableSettings: ISlideTableSettings;
}
