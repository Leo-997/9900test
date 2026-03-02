import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { IGene } from '../Genes/Gene.model';
import {
  Chromosome, Confidence, Inframe, Platform,
} from '../Misc.model';

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
export interface IGermlineSVBase extends IReportableVariant, ICounts {
  internalId: string;
  variantId: number;
  biosampleId: string;
  parentId: string | null;
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
  predictedDisrupted: DisruptedTypes;
  markDisrupted: DisruptedTypes;
  pathscore: number;
  pathclass: string;
  prismclass: string;
  researchCandidate: boolean | null;
}

export interface IGermlineSV extends IGermlineSVBase {
  startGene: IGene;
  endGene: IGene;
  childSVs?: IGermlineSV[];
}

export interface IGermlineSVRaw extends IGermlineSVBase {
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

export interface IGermlineSVSummary {
  biosampleId: string;
  minScore: number;
  maxScore: number;
  avgScore: number;
}
