import { IsString } from 'class-validator';

export interface IGetPatientSamplesQuery {
  patientId: string;
}

export class GetPatientSamplesQueryDTO implements IGetPatientSamplesQuery {
  @IsString()
  public patientId: string;
}
