import { ReactNode } from 'react';
import { staticSlides } from '../../constants/Clinical/slide';
import { IAnalysisSet } from '../Analysis/AnalysisSets.types';
import { Group } from '../Auth/Group.types';
import { IUser } from '../Auth/User.types';
import { FileType } from '../FileTracker/FileTracker.types';
import { IClinicalMeeting } from '../Meetings/Meetings.types';
import { PickByType } from '../misc.types';
import { IPatient, IPatientDetails } from '../Patient/Patient.types';
import { IPurity } from '../Precuration/Purity.types';
import { PseudoStatus } from '../TaskDashboard/TaskDashboard.types';
import { ClinicalReviewStatus, ClinicalStatus } from './ClinicalStatus.types';
import {
  IGeneAltSettings,
  INonGeneAltSettings,
  IPatientDiagnosisSettings,
  ITumourImmuneProfileSettings,
  ITumourMolecularProfileSettings,
} from './Settings.types';

export type Views = (typeof staticSlides[number]);

export type UpdateMolecularGroup = {
  add?: string[];
  remove?: string[];
};

export interface IPatientDiagnosisData {
  label: string;
  value: ReactNode;
}

export interface IFilteredPatientDiagnosisData extends IPatientDiagnosisData {
  mapperName: string;
}

export interface ISlideTableSettings {
  patientDiagnosisSettings?: IPatientDiagnosisSettings;
  molAlterationSettings?: IGeneAltSettings;
  nonGeneMolAlterationSettings?: INonGeneAltSettings;
  tumourMolecularProfileSettings?: ITumourMolecularProfileSettings;
  tumourImmuneProfileSettings?: ITumourImmuneProfileSettings;
}

export interface IClinicalVersionBase {
  id: string;
  version: number;
  analysisSetId: string;
  patientId: string;
  status: ClinicalStatus;
  pseudoStatus: PseudoStatus | null;
  patientAgeAtDeath: string | null;
  vitalStatus: string;
  clinicalHistory: string;
  expedite: boolean;
  isGermlineOnly: boolean;
  frequencyUnits: string;
  meetings: IClinicalMeeting[];
  discussionTitle?: string;
  discussionNote?: string;
  discussionColumns: number;
  presentationModeScale: number;
  slideTableSettings: ISlideTableSettings;
}

export interface IUpdateDiscussionFields {
  discussionTitle?: string;
  discussionNote?: string;
  discussionColumns?: number;
}

export interface IReviewerData {
  reviewerId: string;
  status: ClinicalReviewStatus;
  group: Group;
}

export interface IReviewWithUser extends IReviewerData {
  user?: IUser;
}

export type ClinicalAssigneeMenuOptions = {
  id: string | null;
  type?: 'chair' | 'assignee' | 'reviewer';
  group?: Group;
  groupLabel?: string;
  reviewStatus?: ClinicalReviewStatus;
  disabled?: boolean;
  onSelect?: (user: IUser | null) => void;
};

export interface IClinicalVersionRaw
  extends IClinicalVersionBase {
  curatorId: string | null;
  clinicianId: string | null;
  cancerGeneticistId: string | null;
  reviewerIds: IReviewerData[] | null;
}

export type UpdateClinicalVersionBody = Partial<Pick<IClinicalVersionRaw,
  | 'status'
  | 'pseudoStatus'
  | 'clinicalHistory'
  | 'clinicianId'
  | 'curatorId'
  | 'cancerGeneticistId'
  | 'expedite'
  | 'isGermlineOnly'
  | 'discussionTitle'
  | 'discussionNote'
  | 'discussionColumns'
  | 'frequencyUnits'
  | 'presentationModeScale'
  | 'slideTableSettings'
>>;

export interface IClinicalVersion
  extends IClinicalVersionBase {
  mtbChair: IUser | null;
  curator: IUser | null;
  clinician: IUser | null;
  cancerGeneticist: IUser | null;
  reviewers: IReviewWithUser[];
}

export interface IBaseAttachment {
  fileId: string;
  fileType: FileType;
  url: string;
  title: string;
  caption?: string | null;
}

export interface IAlterationAttachment extends IBaseAttachment {
  checked: boolean;
}

// File width is used for the xs prop on a grid item
// For vertical layout, min is 2, max is 12 (6 columns)
// For horizontal layout, min is 4, max is 12 (3 columns)
export interface ISlideAttachment extends IBaseAttachment {
  slideId: string;
  order: number;
  width: number;
  isCondensed?: boolean;
  isDeleted: boolean;
  sectionId?: string;
  isAtBottom?: boolean;
}

export type AddSlideAttachment = Omit<ISlideAttachment, 'slideId' | 'isDeleted' | 'url' | 'order' | 'isAtBottom'>;

export type UpdateSlideAttachmentSettings = Partial<Pick<ISlideAttachment, 'width' | 'isCondensed' | 'isAtBottom'>>;

export type UpdateSlideAttachmentDetails = Required<Pick<ISlideAttachment, 'title' | 'caption'>>;

export interface IUpdateSlideAttachmentOrder {
  id: string;
  order: number;
}

export interface IPatientDiagnosisColumn {
  label: string;
  key: 'ipass'
    | 'tumourMutationBurden'
    | 'biosamples'
    | 'contamination'
    | 'mtbMeetingDate'
    | keyof PickByType<IPatientDetails, string | number | null>
    | keyof PickByType<IAnalysisSet, string | null | number>
    | keyof PickByType<IPurity, string | null | number>
    | keyof PickByType<IClinicalVersion, string | number | null>;
  visible: boolean;
  settingKey: keyof IPatientDiagnosisSettings;
  displayTransform?: (value: any, patient?: IPatient) => ReactNode;
}
