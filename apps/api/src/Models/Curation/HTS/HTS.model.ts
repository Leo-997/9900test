import {
  combinationTypes, correlationOptions, rationaleOptions, screenStatuses,
} from 'Constants/HTS/HTS.constant';
import { Summary } from '../Misc.model';

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
  wholeCohortCount: number;
  subcohort: string;
  subcohortCount: number;
  controlChangeRatio: number;
  comments: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface IHTSPlots {
  cellsEndPlot: string;
  cellsStartPlot: string;
}

export interface IHTSResult {
  screenId: string;
  biosampleId: string;
  screened: boolean;
  reportTargets: string;
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
  candidateHit: boolean;
  hit: boolean;
  reportable: boolean | null;
  reportingRationale: HTSReportingRationale | null;
  correlation: HTSCorrelation | null;
}

export interface IHTSResultPlots {
  aucPlot: string;
  ic50Plot: string;
  ic50CurvePlot: string;
  ln50Plot: string;
}

export type HTSResultSummary = {
  aucZScore: Summary;
  ic50ZScore: Summary;
  lc50ZScore: Summary;
};

export interface IHTSDrugCombination {
  id: string;
  screenId1: string;
  screenId2: string;
  combinationEffect: CombinationTypes;
  effectCmaxScreen1?: number | null;
  effectCmaxScreen2?: number | null;
  effectCssScreen1?: number | null;
  effectCssScreen2?: number | null;
  effectCmaxCombo?: number | null;
  effectCssCombo?: number | null;
  reportable: boolean | null;
  reportingRationale: HTSReportingRationale | null;
  correlation: HTSCorrelation | null;
}
