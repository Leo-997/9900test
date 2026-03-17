import {
  ChangeEvent, ForwardRefExoticComponent, ReactNode, RefAttributes, type JSX,
} from 'react';
import { geneVariantTypes, variantTypes } from '../constants/Common/variants';
import { ReportType } from './Reports/Reports.types';

export type MuiSelectChangeEvent<T> = ChangeEvent<{ name?: string; value: T; }>

export type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U]

export type RefImperativeHandle<T> = T extends ForwardRefExoticComponent<RefAttributes<infer T2>>
  ? T2
  : never;

export type PickByType<T, Value> = {
  [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

export type GeneVariantType = typeof geneVariantTypes[number];
export type VariantType = typeof variantTypes[number];

export type BaseVariant = {
  variantId: string,
  variantType: VariantType | ReportType;
  cnType?: string; // only for Germline Cytogenetics
}

export interface ISelectOption<T> {
  name: string;
  value: T;
  tooltip?: ReactNode;
  disabled?: boolean;
}

export interface IReportOption<T> extends ISelectOption<T> {
  abbreviation?: 'FT'|'G'|'MTB';
  downloadName: string;
}

export interface ISortMenuOption<T> extends ISelectOption<T> {
  icon?: JSX.Element,
}

export interface ITabOption<T> extends ISelectOption<T> {
  content: ReactNode;
}
