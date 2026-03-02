export const rationaleOptions = [
  'HIT',
  'SENSITIVE',
  'DRUG RELATED',
  'NO HIT',
] as const;

export const correlationOptions = [
  'DIRECT',
  'INDIRECT',
  'NO',
  'UNCLEAR',
] as const;

export const combinationTypes = [
  'SYNERGY',
  'ADDITIVE',
  'ANTAGONISM',
] as const;

export const screenStatuses = [
  'PASS',
  'FAIL',
  'PENDING',
] as const;

export const htsSortColumns = [
  'Z-Score',
  'IC50',
] as const;
