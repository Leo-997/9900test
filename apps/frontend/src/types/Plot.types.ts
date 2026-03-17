export interface Plot {
  plotURL: string;
  legend?: string;
}

export interface CircosPlots {
  circos: string | undefined;
  circosRaw: string | undefined;
}

export interface LinxPlot {
  fileId: string;
  sampleId: string;
  chr?: string;
  clusterIds?: string[];
  created: string;
  genes?: string[];
}

export interface IPlot {
  fileId: string,
  plotURL: string,
}

export interface MutSigPlots {
  fit: IPlot;
  matching: IPlot;
  matrix: IPlot;
}

export interface IRNASeqGenePlot {
  plotURL: string;
}

export interface IRNASeqHMPlots {
  allsorts?: string;
  tallsorts?: string;
}
export interface MethPlots {
  cnProfile: string;
  methProfile: string;
  mgmt: string;
}

export interface IMethGenePlot {
  plotURL: string;
}

export interface QCPlots {
  purpleSomaticVariantPloidyPlot: Plot;
  purpleCopyNumberPlot: Plot;
  purpleMinorAllelePloidyPlot: Plot;
  purplePurityRangePlot: Plot;
  purpleFittedSegmentsPlot: Plot;
  purpleKataegisClustersPlot: Plot;
  purpleClonalityModelPlot: Plot;
  cnvProfilePlot: Plot;
  vafClonalDistPlot: Plot;
  vafSubclonalDistPlot: Plot;
  rigPlot: Plot;
}

export interface QCPlots {
  purpleSomaticVariantPloidyPlot: Plot;
  purpleCopyNumberPlot: Plot;
  purpleMinorAllelePloidyPlot: Plot;
  purplePurityRangePlot: Plot;
  purpleFittedSegmentsPlot: Plot;
  purpleKataegisClustersPlot: Plot;
  purpleClonalityModelPlot: Plot;
  cnvProfilePlot: Plot;
  vafClonalDistPlot: Plot;
  vafSubclonalDistPlot: Plot;
  rigPlot: Plot;
}
