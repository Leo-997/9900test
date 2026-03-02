import { HTSCultureTypes, HTSHitsTypes } from 'Models/FileTracker/FileTracker.model';

export interface ICircosPlots {
  circos: string | undefined;
  circosRaw: string | undefined;
}

export interface ILinxPlot {
  fileId: string;
  sampleId: string;
  chr?: string;
  clusterIds?: string[];
  genes?: string[];
  created: string;
}

export interface ILinxPlotResponse {
  fileName: string;
  fileType: 'png' | 'jpg';
  fileSize: number;
  md5: string;
  key: string;
  bucket: string;
  etag: string;
}

export interface IGenerateLinxPlotResponse {
  error: boolean;
  msg: string;
  file: ILinxPlotResponse | null;
  dataUsed: Pick<ILinxPlot, 'genes' | 'clusterIds' | 'chr'>
}

export interface IPlot {
  plotURL: string;
  fileId?: string;
  legend?: string;
}

export interface IMutSigPlots {
  fit: IPlot;
  matching: IPlot;
  matrix: IPlot;
}

export interface IMethPlots {
  cnProfile: string;
  methProfile: string;
  mgmt: string;
}

export type HTSCulturePlots = Record<HTSCultureTypes, string | null>;
export type HTSDrugHitsPlots = Record<HTSHitsTypes, string | null>;

export interface IQCPlots {
  purpleSomaticVariantPloidyPlot: IPlot;
  purpleCopyNumberPlot: IPlot;
  purpleMinorAllelePloidyPlot: IPlot;
  purplePurityRangePlot: IPlot;
  purpleFittedSegmentsPlot: IPlot;
  purpleKataegisClustersPlot: IPlot;
  purpleClonalityModelPlot: IPlot;
  cnvProfilePlot: IPlot;
  vafClonalDistPlot: IPlot;
  vafSubclonalDistPlot: IPlot;
  rigPlot: IPlot;
}

export interface IRNASeqClassifierPlots {
  allsorts?: string;
  tallsorts?: string;
}
