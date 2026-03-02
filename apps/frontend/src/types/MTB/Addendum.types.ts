/* eslint-disable @typescript-eslint/naming-convention */
export type AddendumType = 'general' | 'hts';

export interface IAddendum {
  id: string;
  clinicalHistory: string;
  title: string;
  note: string;
  discussionTitle: string;
  discussionNote: string;
  clinicalVersionId: string;
  addendumType: AddendumType;
}

export interface IHTSDrugBase {
  id: string;
  sampleId: string;
  htsId: string;
  drugId: string;
  drugName: string;
  targets: string;
  reportable: string;
  reportedAs: string;
  fileId: string;
}

export interface IHTSDrugHit {
  addendumId: string;
  drugId: string;
  description: string;
  tier: string;
}

export interface IHTSScreen {
  htsDrugId: string;
  drugId: string;
  dosePk: string;
  doseSchedule: string;
  dosePaediatric: string;
  doseTolerance: string;
  cmax_ng_ml: number;
  cmax_uM: number;
  css_ng_ml: number;
  css_uM: number;
  cssPeak: string;
  maxResponse: string;
  tumourType: string;
  crpc_uM: number;
  crpc_nM: number;
  paedCancerTrial: string;
  includeReason: string;
  notes: string;
  bloodBrainBarrier: string;
  fdaApproved: boolean;
  tgaApproved: boolean;
}

export interface IHTSDrugWithScreen extends
  IHTSDrugBase, Omit<IHTSScreen, 'htsDrugId'> {}

export interface IHTSDrug extends
  IHTSDrugBase, Omit<IHTSDrugHit, 'addendumId'> {}

export interface IUpdateHTSDrugHitBody {
  removeHit: boolean;
  description?: string;
  tier?: string;
}

export interface IUpdatePastRecommendationBody {
  recommendationId: string;
  mode: 'add' | 'remove';
}
