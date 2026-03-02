import { ICreateTherapyDrug, ITherapyDrug } from '../Drugs/Drugs.types';
import { ICreateTherapyTrial, ITherapyTrial } from '../Drugs/Trials.types';
import { ITherapyBase } from './CommonTherapies.types';

/* CLINICAL THERAPY TYPES */
export interface ITherapy extends ITherapyBase {
  trials: ITherapyTrial[];
  drugs: ITherapyDrug[];
}

export interface ICreateTherapy extends Omit<ITherapyBase, 'id'> {
  drugs: ICreateTherapyDrug[];
  trials: ICreateTherapyTrial[];
}

export interface IMatchingTherapiesQuery {
  chemotherapy?: boolean;
  radiotherapy?: boolean;
  combination: string[];
}
