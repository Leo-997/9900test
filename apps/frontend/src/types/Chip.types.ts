import { ReactNode } from 'react';

export interface IChip {
  label: string;
  key: string;
}

export interface IDateChip {
  date: string;
  tooltip?: ReactNode;
}
