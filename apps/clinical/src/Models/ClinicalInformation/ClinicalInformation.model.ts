import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../Utils/Transformers/ToBoolean.util';

export const infoType = [
  'Yes',
  'No',
  'Not reported',
] as const;
export type InfoType = typeof infoType[number];

export const clinicalInformationField = [
  'Genetic test results prior to enrolment',
  'Relevant family history',
  'Relevant personal history',
  'Other relevant clinical information',
] as const;
export type ClinicalInformationField = typeof clinicalInformationField[number];

export interface IClinicalInformation {
  value: InfoType;
  note?: string;
  isHidden: boolean;
}

export type ClinicalInformationData = Record<ClinicalInformationField, IClinicalInformation>;

export class ClinicalInformationDTO implements IClinicalInformation {
  @IsIn(infoType)
    value: InfoType;

  @IsOptional()
  @IsString()
    note?: string;

  @IsBoolean()
  @ToBoolean()
    isHidden: boolean;
}

export class ClinicalInformationDataDTO {
  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Genetic test results prior to enrolment': IClinicalInformation;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Relevant family history': IClinicalInformation;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Relevant personal history': IClinicalInformation;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Other relevant clinical information': IClinicalInformation;
}

export type ClinicalInformationSettingData =
  Record<ClinicalInformationField, Pick<IClinicalInformation, 'isHidden'>>;

export class ClinicalInformationSettingDTO implements Pick<IClinicalInformation, 'isHidden'> {
  @IsBoolean()
  @ToBoolean()
    isHidden: boolean;
}

export class ClinicalInformationSettingDataDTO {
  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Genetic test results prior to enrolment': Pick<IClinicalInformation, 'isHidden'>;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Relevant family history': Pick<IClinicalInformation, 'isHidden'>;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Relevant personal history': Pick<IClinicalInformation, 'isHidden'>;

  @ValidateNested()
  @Type(() => ClinicalInformationDTO)
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'Other relevant clinical information': Pick<IClinicalInformation, 'isHidden'>;
}

export interface IClinicalInformationRaw {
  id: string;
  slideId: string;
  priorGeneticTest: InfoType;
  priorGeneticTestNote: string;
  familyHistory: InfoType;
  familyHistoryNote: string;
  personalHistory: InfoType;
  personalHistoryNote: string;
  otherInformation: InfoType;
  otherInformationNote: string;
}

export interface IClinicalInformationSettingRaw {
  id: string;
  slideId: string;
  showPriorGeneticTest: boolean;
  showFamilyHistory: boolean;
  showPersonalHistory: boolean;
  showOtherInformation: boolean;
}
