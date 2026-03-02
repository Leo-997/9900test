import { tsnePlotConfig } from '@/constants/tsneplot';
import {
  ICounts, IGene, IReportableVariant, ClassifierClassification,
} from './Common.types';

export interface ISomaticRna extends IReportableVariant, ICounts {
  sampleId: string;
  rnaSeqId: string;
  gene: string;
  geneId: number;
  geneExpression: string | null;
  geneLists: string;
  patientFPKM: string;
  medianFPKM: string;
  patientTPM: string;
  medianTPM: string;
  chromosome: string;
  cytoband: string;
  foldChange: string;
  meanZScore: string;
  relapseFoldChange?: string;
  relapseQValue?: string;
  pairedSample?: string;
  curatorSummary: string;
  researchCandidate: boolean | null;
}

export interface IGenerateRNAPlotBody {
  rnaSeqId: string;
  gene: string;
  zero2Subcat2: string;
  showCategory?: boolean;
  zero2Category?: string | 'Cohort';
  hideCohort?: boolean;
}

export interface IAddGeneRow {
  gene: IGene;
  file?: Blob;
  uploadStatus: boolean;
}

export interface IRNASeqReportData extends ISomaticRna {
  type: string[]
}

export interface IUpdateRnaSeqBody extends Partial<IReportableVariant> {
  outlier?: boolean;
  geneExpression?: string | null;
  researchCandidate?: boolean | null;
}

export interface IRNAClassifierResultFilters {
  reportable?: boolean;
  isClassified?: boolean;
}

export type PredictionScore = number;
export interface IRNAClassifierTable extends IReportableVariant<ClassifierClassification> {
  classifier: string;
  version: string;
  prediction: string;
  predictionLabel: string;
  score: PredictionScore;
  selectedPrediction: boolean;
  researchCandidate: boolean | null;
}

export interface IUpdateRNAClassifier
  extends Partial<IReportableVariant<ClassifierClassification>> {
  researchCandidate?: boolean | null;
}

export interface ITPMData {
  biosampleId: string;
  patientId: string;
  publicSubjectId: string;
  category: string;
  subcat2: string;
  finalDiagnosis: string;
  event: string;
  zscore: number;
  geneId: number;
  tpm: number;
}

export interface IGraphX {
  patientId: string[];
  legend: string[];
  category: string[];
  subcat2: string[];
  finalDiagnosis: string[];
  event: string[];
  zscore: number[];
  gene: string[];
}

export interface IGraphY {
  data: number[][];
  smps: string[];
  vars: string[];
}

export interface IGraph {
  x: IGraphX;
  y: IGraphY;
}

export interface ICategory {
  category: string;
  subcat2: string;
}

export interface IRNASeqGeneTPMPlot {
  category: string;
  categories: ICategory[];
  geneIds: string[];
  geneIndex: number;
  geneName: string;
  graph: IGraph;
  matching: number;
  matchingSample: string[];
  patient: string;
  sampleTPM: number;
  sampleIndex: number;
  sampleName: string;
  subcat2: string;
}

export interface IRNATSNEData {
  biosampleId: string;
  x: number;
  y: number;
  zero2Subcategory2: string;
  zero2FinalDiagnosis: string;
}

export interface ITSNEDataPoint extends IRNATSNEData {
  label: string;
}

export interface ITSNEData {
  id: string;
  data: ITSNEDataPoint[];
}

export interface IGraphData {
  y: {
    vars: string[];
    smps: string[];
    data: number[][];
  };
  z: {
    zero2Subcategory2: (string | null)[];
    zero2FinalDiagnosis: (string | null)[];
  };
}

export type MarkerDecoration = {
  sample: string[];
  text: string;
  variable: string;
  x?: number;
  y?: number;
  adj?: number;
  type?: string;
  fontSize?: number;
};

export type ConfigOverrides = {
  readonly showLegend: boolean;
  readonly xAxis: readonly string[];
  readonly yAxis: readonly string[];
  readonly showXAxis: boolean;
  readonly showYAxis: boolean;
  readonly xAxisShow: boolean;
  readonly yAxisShow: boolean;
  readonly colorBy?: readonly string[];
  readonly decorations?: { readonly marker: readonly MarkerDecoration[] };
};

export type TSNEConfig = Omit<typeof tsnePlotConfig, keyof ConfigOverrides> & ConfigOverrides;
