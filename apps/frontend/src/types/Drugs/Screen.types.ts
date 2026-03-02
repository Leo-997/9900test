import { IDrugMetadata } from './Drugs.types';

export interface IDrugScreen {
  id: string;
  drugId: string;
  drugName: string;
  internalId: string;
  screen: string;
  category: string;
  type: string;
  prodrug: string;
  company: string;
  targets: IDrugMetadata[];
  classes: IDrugMetadata[];
  cohort: string;
  molWeight: number;
  dosePk: string;
  doseSchedule: string;
  dosePaediatric: boolean;
  doseTolerance: string;
  cmaxNgMl: number;
  cmaxUM: number;
  cssNgMl: number;
  cssUM: number;
  cssPeak: string;
  maxResponse: string;
  tumourType: string;
  crpcUM: number;
  crpcNM: number;
  minRequiredUM: number;
  maxRequiredUM: number;
  paedCancerTrial: boolean;
  includeReason: string;
  notes?: string;
  bloodBrainBarrier: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IDrugScreenFilters {
  ids?: string[];
  screenName?: string;
  drugName?: string;
}
