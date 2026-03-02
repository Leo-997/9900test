import {
  IReportableVariant, ICounts, ClassifierClassification, Classification,
} from './Common.types';

export interface ISignatureData extends IReportableVariant, ICounts {
  signature: string;
  contribution: number;
  researchCandidate: boolean | null;
}

export interface IMutationalSignature {
  cancers: Array<string>;
  cancersFull: string;
  aetiology: string;
  aetiologyFull: string;
  features: string;
  comments: string;
}

export interface IUpdateSignature<
  C extends Classification | ClassifierClassification = Classification
> extends Partial<IReportableVariant<C>> {
  researchCandidate?: boolean | null;
}
