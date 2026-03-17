import { HTSCorrelation, HTSReportingRationale, IDetailedHTSResult } from '@/types/HTS.types';
import { ISelectOption, ISortMenuOption } from '@/types/misc.types';

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

export const rationaleSelectOptions: ISelectOption<HTSReportingRationale>[] = [
  {
    name: 'Drug hit',
    value: 'HIT',
  },
  {
    name: 'Sensitive but does not meet criteria of hit',
    value: 'SENSITIVE',
  },
  {
    name: 'Drug related to a pathway with hit',
    value: 'DRUG RELATED',
  },
  {
    name: 'No hit with clinical relevance',
    value: 'NO HIT',
  },
] as const;

export const correlationSelectOptions: ISelectOption<HTSCorrelation>[] = [
  {
    name: 'Yes, direct',
    value: 'DIRECT',
  },
  {
    name: 'Yes, indirect',
    value: 'INDIRECT',
  },
  {
    name: 'No',
    value: 'NO',
  },
  {
    name: 'Unclear evidence',
    value: 'UNCLEAR',
  },
] as const;

export const htsSortMenuOptions: ISortMenuOption<string>[] = [
  {
    name: 'Z-Score: High to Low',
    value: 'Z-Score:desc',
  },
  {
    name: 'Z-Score: Low to High',
    value: 'Z-Score:asc',
  },
  {
    name: 'IC50: High to Low',
    value: 'IC50:desc',
  },
  {
    name: 'IC50: Low to High',
    value: 'IC50:asc',
  },
];
