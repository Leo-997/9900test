import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { ClassifierClassification } from '../Misc.model';

export interface ISomaticRna extends IReportableVariant, ICounts {
  sampleId: string;
  rnaSeqId: string;
  gene: string;
  geneId: string;
  geneExpression: string | null;
  patientFPKM: string;
  medianFPKM: string;
  patientTPM: string;
  medianTPM: string;
  chromosome: string;
  cytoband: string;
  foldChange: string;
  meanZScore: number;
  geneLists: string;
  relapseFoldChange?: string;
  relapseQValue?: string;
  pairedSample?: string;
  outlier: boolean;
  researchCandidate: boolean | null;
}

export interface IRNASeqClassifierData extends IReportableVariant<ClassifierClassification>{
  biosampleId: string;
  classifier: string;
  version: string;
  prediction: string;
  predictionLabel: string;
  score: number;
  selectedPrediction: boolean | null;
  researchCandidate: boolean | null;
}

export interface IPromoteClassifierBody {
  classifier: string;
  version: string;
  prediction: string;
  selectedPrediction: boolean;
}

export interface IRNASeqGeneTPMData {
  rnaSeqId: string;
  patientId: string;
  publicSubjectId: string;
  category: string;
  subcat2: string;
  tpm: number;
  event: string;
  zscore: number;
  finalDiagnosis: string;
  geneId: number;
}

export interface IRNATSNEData {
  biosampleId: string;
  x: number;
  y: number;
  zero2Subcategory2: string;
  zero2FinalDiagnosis: string;
}

export interface IUpdateRNAClassifier
  extends Partial<IReportableVariant<ClassifierClassification>> {
  researchCandidate?: boolean | null;
}

export interface IUpdateRNAClassifierFilters {
  prediction: string
}
