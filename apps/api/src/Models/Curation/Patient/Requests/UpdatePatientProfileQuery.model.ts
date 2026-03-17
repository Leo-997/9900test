import { IsBoolean, IsOptional } from 'class-validator';
import { PartialPick } from 'Models/Misc/PartialPick.model';
import { RequireAtLeastOne } from 'Models/Misc/RequireAtLeastOn.model';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import { IPatientProfile } from '../PatientProfile.model';

export type IUpdatePatientProfile = PartialPick<
  IPatientProfile,
  'clinicalHistory'
>;

export type IUpdatePatientProfileSample = PartialPick<
  IPatientProfile,
  'targetable' | 'ctcCandidate'
>;

export type IUpdatePatientProfileRequired = RequireAtLeastOne<
  IUpdatePatientProfile,
  'clinicalHistory'
>;

export type IUpdatePatientProfileSampleRequired = RequireAtLeastOne<
  IUpdatePatientProfileSample,
  'targetable'
>;

export class UpdatePatientProfileBodyDTO implements IUpdatePatientProfile {
  @IsOptional()
  clinicalHistory: string;
}

export class UpdatePatientProfileSampleBodyDTO
implements IUpdatePatientProfileSample {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  targetable: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  ctcCandidate: boolean;
}
