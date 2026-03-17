import { IClinicalPatientDetails } from '../ClinicalData/ClinicalData.model';

export interface IPatientBase {
  patientId: string;
  sex: string;
  vitalStatus: string;
  hospital: string;
  ageAtDiagnosis: string;
  ageAtDeath: string | null;
  enrolmentDate: string;
}

export interface IPatientDetails extends IPatientBase, IClinicalPatientDetails {}
