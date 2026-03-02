import { ICounts, IReportableVariant } from 'Models/Common/Common.model';

export interface ISignatureData extends IReportableVariant, ICounts {
  signature: string;
  contribution: number;
}

export interface IPlots {
  fit: string;
  matching: string;
  matrix: string;
}
