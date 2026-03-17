import { IGermlineCNV, ISomaticCNV } from './CNV.types';
import { IParsedCytogeneticsData } from './Cytogenetics.types';
import { IMethylationData, IMethylationGeneData, IMethylationPredictionData } from './Methylation.types';
import { ISignatureData } from './MutationalSignatures.types';
import { ISomaticRna } from './RNAseq.types';
import { IGermlineSNV, ISomaticSnv, IReportableGermlineSNV } from './SNV.types';
import { IGermlineSV, ISomaticSV } from './SV.types';

export interface ISampleCurationSummary {
  sampleId: string;
  type: string;
  note: string;
  date?: string;
}

export type IAddOrCreateCurationSummary = Omit<
  ISampleCurationSummary,
  'sampleId'
>;

export type Variant =
  ISomaticCNV
  | ISomaticSnv
  | ISomaticSV
  | ISomaticRna
  | IMethylationData
  | IMethylationGeneData
  | IMethylationPredictionData
  | IGermlineCNV
  | IGermlineSNV
  | IGermlineSV
  | IReportableGermlineSNV
  | IParsedCytogeneticsData
  | ISignatureData;
