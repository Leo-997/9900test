import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { Chromosome } from '../Misc.model';

export type Arm = 'p' | 'q';
export interface ICytogeneticsData extends IReportableVariant, ICounts {
  chr: string;
  sex: string | null;
  arm: string;
  cnType: string;
  cytoband: string;
  avgCN: number;
  aveMinMinorAlleleCN: number;
  researchCandidate: boolean | null;
}

export interface ISampleCytoband extends IReportableVariant {
  chr: Chromosome;
  arm: string;
  cytoband: string;
  avgCN: number | null;
  customCn: number | null;
  cnType: string;
}

interface IAnnotationsBase {
  chr: string;
  start: number;
  end: number;
}

export interface IAnnotationsCopyNumber extends IAnnotationsBase {
  cn: number;
  lohValue: number;
}

export interface IAnnotationsReportableSnvs extends IAnnotationsBase {
  gene: string;
  hgvs: string;
  pathclass: string;
}

export interface IAnnotations {
  copyNumber: IAnnotationsCopyNumber[];
  reportableSnvs: IAnnotationsReportableSnvs[];
}

export interface IArmRanges {
  chr: Chromosome;
  chromosomeBand: string;
}

export interface ICytobandCN {
  biosampleId: string;
  chr: Chromosome;
  arm: Arm;
  cytoband: string;
  avgCN: number;
  minCN: number;
  maxCN: number;
}
