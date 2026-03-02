import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export interface ITherapyTrialBase {
  id: string;
  externalTrialId: string;
  note?: string;
}

export type CreateTherapyTrial = Omit<ITherapyTrialBase, 'id'>

export interface IExternalTrial {
  id: string;
  name: string;
  trialId: string;
}

export interface IFetchTherapyTrial extends Omit<ITherapyTrialBase, 'externalTrialId'> {
  externalTrial: IExternalTrial;
}

export class CreateTherapyTrialDTO implements CreateTherapyTrial {
  @IsString()
  @IsNotEmpty()
    externalTrialId: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
    note?: string;
}
