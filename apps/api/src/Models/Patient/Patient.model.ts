import { IsOptional, IsString } from 'class-validator';

export interface IPatient {
  patientId: string;
  zccSubjectId: string;
  internalId: string;
  labmatrixId: string;
  labmatrixCode: string;
  sex: 'Male' | 'Female' | 'Multi' | 'Unknown';
  germlineAberration: string;
  ageAtDiagnosis: number;
  ageAtDeath: number;
  ageAtEnrolment: number | null;
  vitalStatus: 'Alive' | 'Dead' | 'Unknown';
  hospital: string;
  enrolmentDate: Date;
  registrationDate: Date;
  clinicalHistory: string;
  status: string | null;
  stage: string | null;
  comments: string;
  consanguinityScore: number | null;
}

export interface IUpdatePatientBody {
  clinicalHistory?: string;
  comments?: string;
}

export class UpdatePatientBodyDTO implements IUpdatePatientBody {
  @IsString()
  @IsOptional()
    clinicalHistory?: string;

  @IsString()
  @IsOptional()
    comments?: string;
}
