export interface IImmunoProfile {
  ipassValue?: string | null;
  ipassStatus?: string | null;
}

export interface IPatientProfile extends IImmunoProfile {
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
  contamination: string;
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
}
