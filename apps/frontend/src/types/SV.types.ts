import {
  Chromosome,
  Confidence,
  ICounts,
  IGene,
  Inframe,
  IReportableVariant,
  PathClass,
  Platforms,
} from './Common.types';

export type SvType = 'INS' | 'DEL' | 'INV' | 'BND' | 'DUP' | 'DISRUPTION' | 'SGL' | 'INF';

export type FilterImportance = 'high' | 'mediumhigh' | 'mediumlow' | 'low';

export type DisruptedTypes =
  | 'No'
  | 'Yes'
  | 'Start'
  | 'End'
  | 'Both'
  | 'Unknown';

export interface ISomaticSV extends IReportableVariant, ICounts {
  internalId: number;
  biosampleId: string;
  variantId: number;
  parentId: number | null;
  startGene: IGene;
  endGene: IGene;
  startGeneExons: number;
  endGeneExons: number;
  startFusion: string;
  endFusion: string;
  chrBkpt1: Chromosome;
  posBkpt1: number;
  chrBkpt2: Chromosome;
  posBkpt2: number;
  startAf: number;
  endAf: number;
  ploidy: number;
  svType: SvType;
  inframe: Inframe;
  platforms: Platforms;
  wgsconf: Confidence;
  rnaconf: Confidence | 'None';
  pathscore: number;
  pathclass: PathClass | null;
  prismclass: string;
  markDisrupted: DisruptedTypes;
  predictedDisrupted: DisruptedTypes;
  childSVs?: ISomaticSV[];
  researchCandidate: boolean | null;
}

export type SVSummary = {
  biosampleId: string;
  maxScore: number;
  minScore: number;
  avgScore: number;
};

export interface IGermlineSV extends IReportableVariant, ICounts {
  internalId: string;
  variantId: number;
  biosampleId: string;
  parentId: number | null;
  startGeneExons: number;
  endGeneExons: number;
  startFusion: string;
  endFusion: string;
  startGene: IGene;
  endGene: IGene;
  chrBkpt1: Chromosome;
  posBkpt1: number;
  chrBkpt2: Chromosome;
  posBkpt2: number;
  startAf: number;
  endAf: number;
  ploidy: number;
  svType: SvType;
  inframe: Inframe;
  platforms: Platforms;
  wgsconf: Confidence;
  rnaconf: Confidence | 'None';
  markDisrupted: DisruptedTypes;
  pathscore: number;
  pathclass: PathClass | null;
  prismclass: string;
  predictedDisrupted: DisruptedTypes;
  childSVs?: IGermlineSV[];
  researchCandidate: boolean | null;
}

export type SVGermlineSummary = {
  matchedNormalId: string;
  maxScore: number;
  minScore: number;
  avgScore: number;
};

export interface IUpdateSVBody extends Partial<IReportableVariant> {
  pathclass?: PathClass;
  inframe?: Inframe;
  platforms?: Platforms;
  rnaconf?: Confidence;
  markDisrupted?: DisruptedTypes;
  researchCandidate?: boolean | null;
}

export type SVVariants = ISomaticSV | IGermlineSV;

export interface IClinicalSVVariant {
  startGene: string,
  endGene: string,
  markDisrupted: DisruptedTypes,
  svType: SvType,
}
