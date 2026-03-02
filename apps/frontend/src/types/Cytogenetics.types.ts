import {
  Chromosome, ICounts, IReportableVariant,
} from './Common.types';

export type Arm = 'p' | 'q';

export type CytoCNType = 'AMP' | 'DEL' | 'CTH' | 'GAIN' | 'HOM_DEL' | '1_COPY_LOSS' | 'LOH' | 'NEU_LOH' | 'NEU';
export interface IArmData extends IReportableVariant, ICounts {
  avgCN: number;
  cnType: string;
  aveMinMinorAlleleCN: number | null;
  researchCandidate: boolean | null;
}

export interface ICytogeneticsData extends IReportableVariant, ICounts {
  chr: Chromosome;
  sex: string | null;
  arm: string;
  cytoband: string;
  avgCN: number;
  cnType: string;
  aveMinMinorAlleleCN: number | null;
  researchCandidate: boolean | null;
}

export interface IParsedCytogeneticsData {
  chr: Chromosome;
  cytoband: string;
  p: IArmData;
  q: IArmData;
  annotations: Array<Array<string | number>>;
}

export interface ISampleCytoband extends IReportableVariant {
  chr: Chromosome;
  arm: string;
  cytoband: string;
  avgCN: number | null;
  customCn: number | null;
  cnType: string;
}

export interface IGetCytobandsQuery {
  chr?: Chromosome;
  arm?: Arm;
  cnType?: string;
  reportable?: boolean;
  targetable?: boolean;
}

export interface IUpdateCytobandBody extends Partial<IReportableVariant> {
  cytoband?: string;
  customCn?: number | null;
  cnType?: string;
}

export interface ICreateCytobandBody extends Partial<IReportableVariant> {
  cytoband: string;
  chr: Chromosome;
  arm: Arm;
  customCn: number;
  cnType?: string;
}
export interface ISampleCytobands {
  biosampleId: string;
  chr: string;
  p: ISampleCytoband[];
  q: ISampleCytoband[];
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
  gene: string,
  hgvs: string,
  pathclass: string,
}

export interface IAnnotations {
  copyNumber: IAnnotationsCopyNumber[];
  reportableSnvs: IAnnotationsReportableSnvs[];
}

export interface IAnnotation {
  name: string;
  start: number;
  length: number;
  cn: number;
  rnaexp: number;
  loh: number;
}

export interface ICytobandData {
  cytoband: string;
  cn: number;
}

export interface IArmCNSummary {
  p: {
    min: number;
    max: number;
  };
  q: {
    min: number;
    max: number;
  };
}

export interface IArmRanges {
  chr: Chromosome;
  chromosomeBand: string;
}

export interface IGetChromosomeBandsQuery {
  chr?: Chromosome;
  arm?: Arm;
}
export interface IGetAverageCopyNumberQuery {
  chr: Chromosome;
  arm: Arm;
  start: number;
  end: number;
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
