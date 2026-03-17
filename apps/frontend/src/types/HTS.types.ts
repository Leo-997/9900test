import {
  combinationTypes, correlationOptions, rationaleOptions, screenStatuses,
} from '@/constants/HTS/hts';
import { ISummary } from './Common.types';
import { IDrugMetadata } from './Drugs/Drugs.types';
import { IDrugScreen } from './Drugs/Screen.types';
import { ISortOptions } from './Search.types';

export type CombinationTypes = typeof combinationTypes[number];
export type HTSReportingRationale = typeof rationaleOptions[number];
export type HTSCorrelation = typeof correlationOptions[number];
export type ScreenStatus = typeof screenStatuses[number];

export interface IHTSCulture {
  biosampleId: string;
  biomaterial: string;
  screenName: string;
  htsEvent: string;
  htsSeedDate: string;
  htsScreenDate: string;
  htsEndpointDate: string;
  htsDurationDays: number;
  htsNumDrugs: number;
  htsNumConcs: number;
  htsScreenFormat: string;
  htsPassage: string;
  htsNumCells: number;
  htsViabilityPct: string;
  htsCondCulture: string;
  htsScreenPlatform: string;
  htsRocki: string;
  htsCondIncubation: string;
  htsCultureValidMethod: string;
  htsValidMethod: string;
  htsValidResult: string;
  qcPcCnt: number;
  qcNcCnt: number;
  qcL1Cnt: number;
  qcL1R: number;
  qcL2Cnt: number;
  qcL2R: number;
  qcL3Cnt: number;
  qcL3R: number;
  qcL4Cnt: number;
  qcL4R: number;
  qcStatus: string;
  screenStatus: ScreenStatus;
  qcComment: string;
  version: string;
  comments: string;
  wholeCohortCount: number;
  subcohort: string;
  subcohortCount: number;
  controlChangeRatio: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IHTSReportable {
  reportable: boolean | null;
  reportingRationale: HTSReportingRationale | null;
  correlation: HTSCorrelation | null;
}

export interface IHTSResult extends IHTSReportable {
  screenId: string;
  biosampleId: string;
  screened: boolean;
  reportTargets: string | null;
  aucPatient: number;
  aucZScore: number;
  aucMedian: number;
  aucZScoreSubcohort: number;
  aucMedianSubcohort: number;
  ic50Patient: number;
  ic50Log2ZScore: number;
  ic50Log2Median: number;
  ic50Log2: number;
  ic50Log2ZScoreSubcohort: number;
  ic50Log2MedianSubcohort: number;
  ln50Patient: number;
  ln50Median: number;
  lc50: number;
  lc50Log2ZScore: number;
  lc50Log2Median: number;
  lc50Log2ZScoreSubcohort: number;
  lc50Log2MedianSubcohort: number;
  lc50Log2: number;
  cmax: number;
  effectCmax: number;
  css: number;
  effectCss: number;
  crew: number;
  maximumEffectMtc: string;
  changeRatio: number;
  candidateHit: boolean | null;
  hitCount: number;
  reportableHitCount: number;
}

export interface IHTSDrugHitsPlots {
  AUC: string;
  IC50: string;
  IC50CURVE: string;
  LN50: string;
  LC50: string;
}

export type HTSDrugHitsPlotTypes = keyof IHTSDrugHitsPlots;

export interface IGetDrugHitsPlotsFilters {
  plot: HTSDrugHitsPlotTypes;
}

export interface IHTSCulturePlots {
  CELLS_END: string;
  CELLS_START: string;
  SUNRISE: string;
  LOGR_BAF: string;
  COPY_NUMBER: string;
}

export interface IDetailedHTSResult extends IHTSResult {
  compoundId?: string;
  drugId: string;
  drugName?: string;
  category?: string;
  targets?: IDrugMetadata[];
  classes?: IDrugMetadata[];
}

export type HTSResultSummary = {
  aucZScore: ISummary;
  ic50ZScore: ISummary;
  lc50ZScore: ISummary;
};

export interface IGetHTSResultQuery extends ISortOptions {
  screenIds?: string[];
  hit?: boolean;
  reportable?: boolean;
}

export interface IHTSDrugCombination extends IHTSReportable {
  id: string;
  biosampleId: string;
  screenId1: string;
  screenId2: string;
  combinationEffect: CombinationTypes;
  effectCmaxScreen1?: number | null;
  effectCmaxScreen2?: number | null;
  effectCssScreen1?: number | null;
  effectCssScreen2?: number | null;
  effectCmaxCombo?: number | null;
  effectCssCombo?: number | null;
}

export interface IDetailedHTSDrugCombination extends IHTSDrugCombination {
  screen1Data?: IDrugScreen;
  screen2Data?: IDrugScreen;
}

export interface IHTSDrugCombinationQuery {
  screenIds?: string[];
  hit?: boolean;
  reportable?: boolean;
}

export interface IUpdateHTSCultureBody {
  screenStatus?: ScreenStatus;
}
