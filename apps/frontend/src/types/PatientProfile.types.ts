import { researchCandidateReasons } from '@/constants/Curation/patientProfile';

export type PatientProfile = {
  patientId: string;
  sampleId: string;
  sex: string;
  study: string;
  hospital: string;
  enrolmentDate: string;
  ageAtDiagnosis: number;
  ageAtSample: number;
  ageAtDeath: number;
  ageAtEnrolment: number | null;
  vitalStatus: string;
  msStatus: string;
  lohProportion: number;
  event: string;
  purity: number;
  minPurity: number;
  maxPurity: number;
  ploidy: number;
  minPloidy: number;
  maxPloidy: number;
  amberQC: string;
  contaminationPercentage: number;
  mutationsPerMb: number;
  somMissenseSnvCount?: number | null;
  cancerSubtype: string;
  genePanel: string;
  zero2Category: string;
  zero2Subcat1: string;
  zero2Subcat2: string;
  zero2FinalDiagnosis: string;
  cohort: string;
  cohortRationale: string;
  histology: string;
  priSite: string;
  sampleSite: string;
  sampleMetSite: string;
  metDisease: string;
  clinicalHistory: string;
  targetable: boolean;
  ctcCandidate: boolean;
  germlineAberration: string;
  ipassValue?: string | null;
  ipassStatus?: string | null;
};

export type Sample = {
  patientId: string;
  tumourId: string;
  rnaseqId: string;
  normalId: string;
  methId: string;
  donorId: string;
  zccSubjectId: string;
};

export type Validation = {
  patientId: string;
  sampleId: string;
  precurationValidated: boolean;
};

export type PatientProfileSample = Partial<Pick<PatientProfile, 'targetable' | 'ctcCandidate'>>;

export type ResearchCandidateReason = typeof researchCandidateReasons[number];
