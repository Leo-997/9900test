import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { IGene } from 'Models/Curation/Genes/Gene.model';
import {
  Chromosome,
  Confidence,
  Inframe,
  Platform,
} from 'Models/Curation/Misc.model';

export type SVType =
  | 'INV'
  | 'BND'
  | 'DEL'
  | 'DUP'
  | 'INS'
  | 'SPLICE'
  | 'SGL'
  | 'INF'
  | 'DISRUPTION';

export const disruptedTypes = [
  'No',
  'Yes',
  'Start',
  'End',
  'Both',
  '',
] as const;
export type DisruptedTypes = typeof disruptedTypes[number];

export interface ISomaticSVBase extends IReportableVariant, ICounts {
  internalId: number;
  biosampleId: string;
  variantId: number;
  parentId: number | null;
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
  svType: SVType;
  inframe: Inframe;
  platforms: Platform;
  wgsconf: Confidence;
  rnaconf: Confidence | 'None';
  pathscore: number;
  pathclass: string;
  prismclass: string;
  markDisrupted: DisruptedTypes;
  predictedDisrupted: DisruptedTypes;
  researchCandidate: boolean | null;
}

export interface ISomaticSVRaw extends ISomaticSVBase {
  'startGene.geneId': number;
  'startGene.gene': string;
  'startGene.chromosome': string;
  'startGene.geneStart': number;
  'startGene.geneEnd': number;
  'startGene.chromosomeBand': string;
  'endGene.geneId': number;
  'endGene.gene': string;
  'endGene.chromosome': string;
  'endGene.geneStart': number;
  'endGene.geneEnd': number;
  'endGene.chromosomeBand': string;
}

export interface ISomaticSV extends ISomaticSVBase {
  startGene: IGene;
  endGene: IGene;
  childSVs?: ISomaticSV[];
}

export interface ISomaticSVSummary {
  biosampleId: string;
  minScore: number;
  maxScore: number;
  avgScore: number;
}
