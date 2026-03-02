import { IClinicalMeeting } from './Meetings/Meetings.types';
import { IAddendum } from './MTB/Addendum.types';
import { ClinicalStatus } from './MTB/ClinicalStatus.types';
import { IReviewerData } from './MTB/MTB.types';
import { PseudoStatus } from './TaskDashboard/TaskDashboard.types';

export type DashboardMeetingType = 'Curation' | 'Clinical';

export interface IClinicalDashboardSample {
  clinicalVersionId: string;
  analysisSetId: string;
  patientId: string;
  vitalStatus: string;
  clinicalStatus: ClinicalStatus;
  pseudoStatus: PseudoStatus | null;
  expedite: boolean;
  isGermlineOnly: boolean;
  zero2FinalDiagnosis: string;
  meetings: IClinicalMeeting[];
  hasGermlineFindings?: boolean;
  curatorId: string;
  clinicianId: string;
  cancerGeneticistId: string;
  addendums: IAddendum[];
  reviewerIds: IReviewerData[];
  slidesStartedAt: string | null;
  slidesFinalisedAt: string | null;
  updatedAt: string;
}

export interface IClinicalDashboardData {
  patientId: string;
  vitalStatus: string;
  gender: string;
  samples: IClinicalDashboardSample[];
}
