import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { clinicalStatuses, pseudoStatuses } from 'Constants/ClinicalVersion/ClinicalVersion.constant';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { IAddendum } from '../Addendum/Addendum.model';
import {
  ClinicalVersionStatus, IReviewerData, PseudoStatus,
} from '../ClinicalVersion/ClinicalVersion.model';
import { Group, userGroups } from '../Group/Group.model';
import { IClinicalMeeting } from '../Meetings/Meetings.model';
import { IMolAdditionalData } from '../MolecularAlterations/MolecularAlteration.model';
import { IPatientDiagnosisSettings, PatientDiagnosisSettingDTO } from '../Settings/Diagnosis/DiagnosisSetting.model';
import {
  GeneAltSettingsDTO, IGeneAltSettings, INonGeneAltSettings, NonGeneAltSettingsDTO,
} from '../Settings/MAT/MolAlterationSettings.model';
import {
  ITumourImmuneProfileSettings,
  ITumourMolecularProfileSettings,
  TumourImmuneProfileSettingsDTO,
  TumourMolecularProfileSettingsDTO,
} from '../Settings/TumourProfile/TumourProfile.settings';

export type ReviewStatus = 'Assigned' | 'Ready for Review' | 'In Progress' | 'Completed';

export interface ISampleDetail {
  groupId: string;
  molAlterationId: string;
  patientId: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  additionalData: IMolAdditionalData;
  groupName: string;
  mtbDate: Date;
  count: number;
}

export interface IUpdateReview {
  status: ReviewStatus;
  group: Group;
}

export class UpdateReviewDTO
implements IUpdateReview {
  @IsIn(['Assigned', 'Ready for Review', 'In Progress', 'Completed'])
    status: ReviewStatus;

  @IsIn(userGroups)
    group: Group;
}

export interface IReviewerBody {
  reviewerId: string;
  group: Group;
}

export class ReviewerBodyDTO
implements IReviewerBody {
  @IsString()
    reviewerId: string;

  @IsIn(userGroups)
    group: Group;
}

export interface ISlideTableSettings {
  patientDiagnosisSettings?: IPatientDiagnosisSettings;
  molAlterationSettings?: IGeneAltSettings;
  nonGeneMolAlterationSettings?: INonGeneAltSettings;
  tumourMolecularProfileSettings?: ITumourMolecularProfileSettings;
  tumourImmuneProfileSettings?: ITumourImmuneProfileSettings;
}

export class SlideTableSettingsDTO implements ISlideTableSettings {
  @IsOptional()
  @ValidateNested()
  @Type(() => PatientDiagnosisSettingDTO)
    patientDiagnosisSettings?: IPatientDiagnosisSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeneAltSettingsDTO)
    molAlterationSettings?: IGeneAltSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => NonGeneAltSettingsDTO)
    nonGeneMolAlterationSettings?: INonGeneAltSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => TumourMolecularProfileSettingsDTO)
    tumourMolecularProfileSettings?: ITumourMolecularProfileSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => TumourImmuneProfileSettingsDTO)
    tumourImmuneProfileSettings?: ITumourImmuneProfileSettings;
}

export interface IUpdateClinicalVersionData {
  status?: ClinicalVersionStatus;
  pseudoStatus?: PseudoStatus | null;
  clinicalHistory?: string;
  clinicianId?: string;
  curatorId?: string;
  cancerGeneticistId?: string;
  expedite?: boolean;
  isGermlineOnly?: boolean;
  frequencyUnits?: string;
  discussionTitle?: string;
  discussionNote?: string;
  discussionColumns?: number;
  presentationModeScale?: number;
  slideTableSettings?: ISlideTableSettings;
}

export class UpdateClinicalVersionDataDTO implements IUpdateClinicalVersionData {
  @IsOptional()
  @IsIn(clinicalStatuses)
    status?: ClinicalVersionStatus;

  @IsOptional()
  @IsIn(pseudoStatuses)
  @ValidateIf((o, v) => v !== null)
    pseudoStatus?: PseudoStatus | null;

  @IsOptional()
  @IsString()
    clinicalHistory?: string;

  @IsOptional()
  @IsString()
    clinicianId?: string;

  @IsOptional()
  @IsString()
    curatorId?: string;

  @IsOptional()
  @IsString()
    cancerGeneticistId?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    expedite?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isGermlineOnly?: boolean;

  @IsOptional()
  @IsString()
    frequencyUnits?: string;

  @IsOptional()
  @IsString()
    discussionTitle?: string;

  @IsOptional()
  @IsString()
    discussionNote?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
    discussionColumns?: number;

  @IsOptional()
  @IsNumber()
  @Min(95)
  @Max(135)
  @Type(() => Number)
    presentationModeScale?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SlideTableSettingsDTO)
    slideTableSettings?: ISlideTableSettings;
}

export interface ISampleFilters {
  search?: string[];
  analysisSetIds?: string[];
  expedited?: boolean;
  gender?: string[];
  vitalStatus?: string[];
  ageRange?: number[];
  eventType?: string[];
  startMtb?: string;
  endMtb?: string;
  startHts?: string;
  endHts?: string;
  startEnrolment?: string;
  endEnrolment?: string;
  zero2FinalDiagnosis?: string[];
  sortColumns?: string[];
  sortDirections?: string[];
  clinicalStatus?: string[];
  pseudoStatuses?: PseudoStatus[];
  assignees?: string[];
  page?: number;
  limit?: number;
}

export interface ISampleData {
  clinicalVersionId: string;
  analysisSetId: string;
  patientId: string;
  vitalStatus: string;
  clinicalStatus: string;
  pseudoStatus: PseudoStatus | null;
  expedite: boolean;
  isGermlineOnly: boolean;
  zero2FinalDiagnosis: string;
  meetings: IClinicalMeeting[];
  curatorId: string;
  clinicianId: string;
  cancerGeneticistId: string;
  addendums: IAddendum[];
  reviewerIds: IReviewerData[];
  hasGermlineFindings?: boolean;
  slidesStartedAt: string | null;
  slidesFinalisedAt: string | null;
  updatedAt: string;
}

export interface IPatientResponse {
  patientId: string;
  vitalStatus: string;
  gender: string;
  samples: ISampleData[];
}
