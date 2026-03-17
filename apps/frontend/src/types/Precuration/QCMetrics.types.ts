export interface ISeqMetrics {
  biosampleId: string;
  platformId: string;
  meanCoverage: number;
  x20: number;
  x30: number;
  x50: number;
  amberQC: string;
  amberContaminationPct: number;
  qcStatus: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface IRNASeqMetrics {
  rnaBiosample: string;
  uniqMappedReads: number;
  uniqMappedReadsPct: number;
  rin: number;
}

export interface IImmunoprofile {
  biosampleId: string;
  ipassValue: number;
  ipassStatus: string;
  ipassptile: number;
  cd8Value: number;
  cd8ptile: number;
  m1m2Value: number;
  m1m2ptile: number;
}
