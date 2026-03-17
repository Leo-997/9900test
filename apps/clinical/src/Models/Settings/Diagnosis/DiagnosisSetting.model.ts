import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ToBoolean } from '../../../Utils/Transformers/ToBoolean.util';

export interface IPatientDiagnosisSettings {
  showOncologist?: boolean;
  showHospital?: boolean;
  showTimeToMtb?: boolean;
  showDiagnosis?: boolean;
  showEvent?: boolean;
  showSampleType?: boolean;
  showTumour?: boolean;
  showGermline?: boolean;
  showEnrolment?: boolean;
  showStudy?: boolean;
  showMsiStatus?: boolean;
  showLOH?: boolean;
  showPreservationState?: boolean;
  showCohort?: boolean;
  showHistologicalDiagnosis?: boolean;
  showCategory?: boolean;
  showCancerType?: boolean;
  showFinalDiagnosis?: boolean;
  showContamination?: boolean;
  showPurity?: boolean;
  showPloidy?: boolean;
  showIPASS?: boolean;
  showTumourMutationMb?: boolean;
}

export class PatientDiagnosisSettingDTO implements IPatientDiagnosisSettings {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showOncologist?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showHospital?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showTimeToMtb?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showDiagnosis?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showEvent?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showSampleType?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showTumour?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showGermline?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showEnrolment?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showStudy?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showMsiStatus?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showLOH?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPreservationState?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showCohort?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showHistologicalDiagnosis?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showCategory?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showCancerType?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showFinalDiagnosis?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showContamination?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPurity?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showPloidy?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showIPASS?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
    showTumourMutationMb?: boolean;
}
