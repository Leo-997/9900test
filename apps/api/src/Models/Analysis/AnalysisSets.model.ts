import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { SortString } from 'Models/Curation/Misc.model';
import { IPaginationRequest, PaginationRequestDTO } from 'Models/Misc/Requests/PaginationDto.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  changeOrRefinementOptions,
  clinicalStatuses,
  curationReviewStatuses,
  curationStatuses,
  failedStatusReasons,
  htsStatuses,
  pathologistAgreementOptions,
  pseudoStatuses,
  researchCandidateReasons,
  leukeamiaSubtypeOptions,
} from 'Constants/Analysis/AnalysisSets.constant';
import { IBiosample } from './Biosamples.model';

export type CurationStatus = typeof curationStatuses[number];
export type PseudoStatus = typeof pseudoStatuses[number];
export type CurationReviewStatus = typeof curationReviewStatuses[number];
export type HtsStatus = typeof htsStatuses[number];
export type ClinicalStatus = typeof clinicalStatuses[number]

export type FailedStatusReason = typeof failedStatusReasons[number];
export type ResearchCandidateReason = typeof researchCandidateReasons[number];

export type ChangeOrRefinementOption = typeof changeOrRefinementOptions[number];
export type PathologistAgreementOption = typeof pathologistAgreementOptions[number];
export type LeukeamiaSubtypeOption = typeof leukeamiaSubtypeOptions[number];

export interface IAnalysisSet {
  analysisSetId: string;
  patientId: string;
  publicSubjectId: string;
  c1EventNum: number;
  sequencedEvent: string;
  diagnosisEvent: string;
  analysisEvent: string;
  cohort: string;
  cohortRationale: string;
  cancerSubtype: string;
  highRisk: boolean;
  study: string;
  genePanel: string;
  histologicDiagnosis: string;
  confirmedDiagnosis: boolean;
  zero2Category: string;
  zero2Subcategory1: string;
  zero2Subcategory2: string;
  zero2FinalDiagnosis: string;
  whoGrade: string;
  histology: string;
  molecularConfirmation: string;
  priSite: string;
  sampleSite: string;
  sampleMetSite: string;
  metDisease: string;
  ncitTerm: string;
  ncitCode: string;
  somMissenseSnvs: number;
  expedite: boolean;
  finalPass: number;
  mutBurdenMb: number;
  targetable: boolean;
  ctcCandidate: boolean;
  researchCandidate: string | null;
  lohProportion: number;
  failed: boolean;
  curationStatus: CurationStatus;
  pseudoStatus: PseudoStatus | null;
  failedStatusReason: FailedStatusReason;
  curationStartedAt: string | null;
  curationFinalisedAt: string | null;
  caseFinalisedAt: string | null;
  htsStatus: HtsStatus;
  secondaryCurationStatus: CurationReviewStatus;
  primaryCuratorId: string;
  secondaryCuratorId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // from purity table
  purity: number;
  ploidy: number;

  // aggregated results
  biosamples?: IBiosample[];
  relatedCases?: IAnalysisSet[];

  // from meeting table
  meetingDate: string;
}

export interface IAnalysisPatient {
  publicSubjectId: string;
  vitalStatus: string;
  gender: string;
  ageAtDiagnosis: number;
  ageAtDeath: number;
  ageAtEnrolment: number | null;
  analysisSets?: IAnalysisSet[];
  // The following properties are only relevant for "Registered-only patients"
  // ie patients that do not have a record in zcc_analysis_set yet
  // and for "withdrawn" patients
  patientId?: string;
  study?: string;
  enrolmentDate?: string;
  registrationDate?: string;
  stage?: string;
  comments?: string;
}

export interface ICurationSummary {
  analysisSetId: string;
  type: string;
  note: string;
  date?: string;
}

export type IUpdateCurationSummaryBody = Omit<
  ICurationSummary,
  'analysisSetId'
>;

export interface IAnalysisSetFilters extends IPaginationRequest {
  search?: string[];
  analysisSetIds?: string[];
  patientId?: string;
  all?: boolean;
  expedited?: boolean;
  gender?: string[];
  vitalStatus?: string[];
  ageRange?: number[];
  startCuration?: string;
  endCuration?: string;
  startEnrolment?: string;
  endEnrolment?: string;
  secondaryCuratorId?: string;
  curationStatus?: CurationStatus[];
  pseudoStatuses?: PseudoStatus[];
  eventType?: string[];
  study?: string[];
  cohort?: string[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  meetingDate?: string;
  primaryCurators?: string[];
  secondaryCurators?: string[];
  purity?: number[];
  mutBurden?: number[];
  methClassifiers?: string[];
  mgmtStatus?: string[];
  sortColumns?: string[];
  sortDirections?: SortString[];
  publicSubjectId?: string;
  includeRelatedCases?: boolean;
  includeBiosamples?: boolean;
  externalAssignedCases?: string[];
  pendingReports?: string[];
  activeCases?: boolean;
  enrolledOnlyCases?: boolean;
  withdrawnCases?: boolean;
}

export interface IMolecularConfirmation {
  changeOrRefinement: ChangeOrRefinementOption,
  changeOrRefinementNotes: string | null,
  pathologistAgreement: PathologistAgreementOption,
  pathologistCommunicationMethod: string | null,
  pathologistAgreementNotes: string | null,
  finalDiagnosisUpdated: boolean,
  diagnosisSubtype: LeukeamiaSubtypeOption | null,
  zero2ConfirmedSubtype: LeukeamiaSubtypeOption | null,
}

export type UpdateMolecularConfirmationBody = Partial<IMolecularConfirmation>;

export class UpdateMolecularConfirmationBodyDTO implements UpdateMolecularConfirmationBody {
  @IsOptional()
  @IsIn(changeOrRefinementOptions)
    changeOrRefinement?: ChangeOrRefinementOption;

  @IsOptional()
  @IsString()
    changeOrRefinementNotes?: string | null;

  @IsOptional()
  @IsIn(pathologistAgreementOptions)
    pathologistAgreement?: PathologistAgreementOption;

  @IsOptional()
  @IsString()
    pathologistCommunicationMethod?: string | null;

  @IsOptional()
  @IsString()
    pathologistAgreementNotes?: string | null;

  @IsOptional()
  @IsBoolean()
    finalDiagnosisUpdated?: boolean;

  @IsOptional()
  @IsIn(leukeamiaSubtypeOptions)
    diagnosisSubtype?: LeukeamiaSubtypeOption | null;

  @IsOptional()
  @IsIn(leukeamiaSubtypeOptions)
    zero2ConfirmedSubtype?: LeukeamiaSubtypeOption | null;
}

export class AnalysisSetFiltersDTO extends PaginationRequestDTO implements IAnalysisSetFilters {
  @IsOptional()
  @IsString({ each: true })
    search?: string[];

  @IsOptional()
  @IsString({ each: true })
    analysisSetIds?: string[];

  @IsOptional()
  @IsString()
    patientId?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    all?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    expedited?: boolean;

  @IsOptional()
  @IsString({ each: true })
    gender?: string[];

  @IsOptional()
  @IsString({ each: true })
    vitalStatus?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(21, { each: true })
    ageRange?: number[];

  @IsOptional()
  @IsDateString()
    startCuration?: string;

  @IsOptional()
  @IsDateString()
    endCuration?: string;

  @IsOptional()
  @IsDateString()
    startEnrolment?: string;

  @IsOptional()
  @IsDateString()
    endEnrolment?: string;

  @IsOptional()
  @IsString()
    secondaryCuratorId?: string;

  @IsOptional()
  @IsIn(curationStatuses, { each: true })
    curationStatus?: CurationStatus[];

  @IsOptional()
  @IsIn(pseudoStatuses, { each: true })
    pseudoStatuses?: PseudoStatus[];

  @IsOptional()
  @IsString({ each: true })
    eventType?: string[];

  @IsOptional()
  @IsString({ each: true })
    study?: string[];

  @IsOptional()
  @IsString({ each: true })
    cohort?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Category?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat1?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat2?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2FinalDiagnosis?: string[];

  @IsOptional()
  @IsString()
    meetingDate?: string;

  @IsOptional()
  @IsString({ each: true })
    primaryCurators?: string[];

  @IsOptional()
  @IsString({ each: true })
    secondaryCurators?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(1, { each: true })
    purity?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({ allowInfinity: true }, { each: true })
  @Min(0, { each: true })
    mutBurden?: number[];

  @IsOptional()
  @IsString({ each: true })
    methClassifiers?: string[];

  @IsOptional()
  @IsString({ each: true })
    mgmtStatus?: string[];

  @IsOptional()
  @IsString({ each: true })
    sortColumns?: string[];

  @IsOptional()
  @IsIn(['asc', 'desc'], { each: true })
    sortDirections?: SortString[];

  @IsOptional()
  @IsString()
    publicSubjectId?: string;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    includeRelatedCases?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    includeBiosamples?: boolean;

  @IsOptional()
  @IsString({ each: true })
    externalAssignedCases?: string[];

  @IsOptional()
  @IsString({ each: true })
    pendingReports?: string[];

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    activeCases?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    enrolledOnlyCases?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    withdrawnCases?: boolean;
}

export interface IUpdateAnalysisSetBody {
  primaryCuratorId?: string | null;
  secondaryCuratorId?: string | null;
  curationStatus?: string | null;
  pseudoStatus?: PseudoStatus | null;
  failedStatusReason?: string | null;
  finaliseCase?: boolean;
  secondaryCurationStatus?: string | null;
  htsStatus?: string | null;
  expedite?: boolean;
  targetable?: boolean;
  ctcCandidate?: boolean;
  researchCandidate?: ResearchCandidateReason | null;
}

export class UpdateAnalysisSetBodyDTO implements IUpdateAnalysisSetBody {
  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null)
    primaryCuratorId?: string | null;

  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null)
    secondaryCuratorId?: string | null;

  @IsOptional()
  @IsIn(curationStatuses)
  @ValidateIf((object, value) => value !== null)
    curationStatus?: string | null;

  @IsOptional()
  @IsIn(pseudoStatuses)
  @ValidateIf((object, value) => value !== null)
    pseudoStatus?: PseudoStatus | null;

  @IsOptional()
  @IsIn(failedStatusReasons)
  @ValidateIf((object, value) => value !== null)
    failedStatusReason?: string | null;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    finaliseCase?: boolean;

  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null)
    secondaryCurationStatus?: string | null;

  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null)
    htsStatus?: string | null;

  @IsOptional()
  @IsBoolean()
  @ValidateIf((object, value) => value !== null)
    expedite?: boolean;

  @IsOptional()
  @IsBoolean()
  @ValidateIf((object, value) => value !== null)
    targetable?: boolean;

  @IsOptional()
  @IsBoolean()
  @ValidateIf((object, value) => value !== null)
    ctcCandidate?: boolean;

  @IsOptional()
  @IsIn(researchCandidateReasons)
  @ValidateIf((object, value) => value !== null)
    researchCandidate?: ResearchCandidateReason | null;
}

export class UpdateCurationSummaryBodyDTO implements IUpdateCurationSummaryBody {
  @IsString()
    type: string;

  @IsString()
    note: string;

  @IsOptional()
  @IsDateString()
    date?: string;
}

export interface ITriggerExportBody {
  type: 'CASE' | 'HTS';
  clinicalStatus?: ClinicalStatus;
}

export class TriggerExportBodyDTO implements ITriggerExportBody {
  @IsIn(['CASE', 'HTS'])
    type: 'CASE' | 'HTS';

  @IsOptional()
  @IsIn(clinicalStatuses)
    clinicalStatus: ClinicalStatus;
}

export type DiagnosisFilters = Pick<
  IAnalysisSetFilters,
 'zero2Category'
  | 'zero2Subcat1'
  | 'zero2Subcat2'
  | 'zero2FinalDiagnosis'
>;

export interface IDiagnosisOptionCombination {
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
}

export class DiagnosisFiltersDTO implements DiagnosisFilters {
  @IsOptional()
  @IsString({ each: true })
    zero2Category?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat1?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2Subcat2?: string[];

  @IsOptional()
  @IsString({ each: true })
    zero2FinalDiagnosis?: string[];
}
