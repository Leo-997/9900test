import { SxProps } from '@mui/material';
import { CSSProperties, ReactNode } from 'react';
import { ReportVariantType } from './Reports.types';

export interface IReportTableCell {
  width: number | string;
  styleOverrides?: SxProps | undefined;
  colSpan?: number;
  rowSpan?: number;
  content?: string | ReactNode;
}

export interface IReportTableRow {
  columns: IReportTableCell[];
  interpretation?: string;
  styleOverrides?: CSSProperties | undefined;
  noBottomBorder?: boolean;
  breakable?: boolean;
  entityType?: ReportVariantType;
  entityId?: string;
}

export interface IPatientDetailsCell {
  title: string;
  value: string;
  width: string;
}

export interface IReportTableCommentOptions {
  entityType: ReportVariantType;
  disabled?: boolean;
}
