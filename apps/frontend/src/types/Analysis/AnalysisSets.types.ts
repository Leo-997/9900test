import { IClinicalDashboardSample } from '../Dashboard.types';
import { ResearchCandidateReason } from '../PatientProfile.types';
import { IReport } from '../Reports/Reports.types';
import {
  Cohorts,
  CurationStatus,
  FailedStatusReason,
  GenePanel,
  HtsStatus,
  SecondaryCurationStatus,
} from '../Samples/Sample.types';
import { PseudoStatus } from '../TaskDashboard/TaskDashboard.types';
import { IBiosample } from './Biosamples.types';

export interface IAnalysisSet {
  analysisSetId: string;
  patientId: string;
  publicSubjectId: number;
  c1EventNum: number;
  sequencedEvent: string;
  diagnosisEvent: string;
  analysisEvent: string;
  cohort: Cohorts | null;
  cohortRationale: string;
  cancerSubtype: string;
  highRisk: boolean;
  study: string;
  genePanel: GenePanel;
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
  researchCandidate: ResearchCandidateReason | null;
  lohProportion: number;
  failed: boolean;
  curationStatus: CurationStatus;
  pseudoStatus: PseudoStatus | null;
  failedStatusReason: FailedStatusReason;
  curationStartedAt: string | null;
  curationFinalisedAt: string | null;
  caseFinalisedAt: string | null;
  secondaryCurationStatus: SecondaryCurationStatus;
  htsStatus: HtsStatus;
  primaryCuratorId: string | null;
  secondaryCuratorId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;

  // from patient table
  vitalStatus: string;
  gender: string;

  // from purity table
  purity: number;
  ploidy: number;

  // aggregated results
  biosamples?: IBiosample[];
  relatedCases?: IAnalysisSet[];

  // from meeting table
  meetingDate: string | null;

  // for task dashboard only
  reports?: IReport[];
  clinicalData?: IClinicalDashboardSample;
}

export interface IAnalysisPatient {
  publicSubjectId: number;
  vitalStatus: string;
  gender: string;
  ageAtDiagnosis: number;
  ageAtDeath: number;
  ageAtEnrolment: number | null;
  analysisSets: IAnalysisSet[];
  // The following properties are only relevant for "Registered-only patients"
  // ie patients that do not have a record in zcc_analysis_set yet
  // and for "withdrawn" patients
  patientId?: string;
  study?: string;
  enrolmentDate?: string;
  registrationDate?: Date;
  stage?: string;
  comments?: string;
}

export interface IAnalysisSetFilters {
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
  anyCuratorId?: string;
  primaryCuratorId?: string;
  secondaryCuratorId?: string;
  curationStatus?: CurationStatus[];
  pseudoStatuses?: PseudoStatus[];
  study?: string[];
  eventType?: string[];
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
  sortDirections?: ('asc' | 'desc')[];
  publicSubjectId?: number;
  includeRelatedCases?: boolean;
  includeBiosamples?: boolean;
  externalAssignedCases?: string[]; // Used in the BE for sorting TaskDashboard rows
  pendingReports?: string[]; // Used in BE to calculate overdue reports
  activeCases?: boolean;
  enrolledOnlyCases?: boolean;
  withdrawnCases?: boolean;
}

export interface IUpdateAnalysisSetBody {
  primaryCuratorId?: string | null;
  secondaryCuratorId?: string | null;
  curationStatus?: CurationStatus | null;
  pseudoStatus?: PseudoStatus | null;
  failedStatusReason?: FailedStatusReason;
  finaliseCase?: boolean;
  secondaryCurationStatus?: string | null;
  htsStatus?: HtsStatus | null;
  expedite?: boolean;
  targetable?: boolean;
  ctcCandidate?: boolean;
  researchCandidate?: ResearchCandidateReason | null;
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
