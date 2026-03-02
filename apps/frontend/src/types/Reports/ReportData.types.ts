import { Cohorts } from '../Samples/Sample.types';

export interface IReportPatientProfile {
  sex: string;
  enrolmentDate: string;
  histologicalDiagnosis: string;
  cohort: Cohorts;
  event: string;
}

export interface IReportMolecularProfileSample {
  somMissenseSnvs?: number;
  mutBurdenMb?: number;
}
