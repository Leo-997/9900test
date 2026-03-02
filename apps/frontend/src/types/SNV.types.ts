import type { VariantCounts } from '@zero-dash/types';
import { zygosity } from '../constants/Curation/snv';
import {
  ICounts,
  IReportableVariant,
  PathClass,
  Platforms,
} from './Common.types';

export type Zygosity = typeof zygosity[number];

export interface IChromPosRefAlt {
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
}

export interface ISomaticSnv extends IReportableVariant, ICounts {
  heliumScore: number;
  heliumBreakdown: string;
  internalId: number;
  biosampleId: string;
  variantId: string;
  geneId: number;
  gene: string;
  chr: string;
  pos: number;
  snvRef: string;
  alt: string;
  hgvs?: string;
  genotype?: string;
  consequence?: string;
  depth?: number;
  altad?: number;
  copyNumber?: number;
  adjustedCopyNumber?: number;
  biallelic?: boolean;
  subclonalLikelihood?: number;
  loh?: string;
  inGermline?: boolean;
  geneLists?: string;
  pathScore?: number;
  platforms?: Platforms;
  rnaTpm?: number;
  rnaVaf?: string;
  rnaVafNo?: number;
  rnaImpact?: string;
  rnaAltad?: number;
  rnaDepth?: number;
  panelVaf?: number;
  adjustedVaf?: number;
  pecan?: boolean | null;
  pathclass?: PathClass;
  importance: number;
  gnomadAFGenomePopmax?: number;
  gnomadAFExomePopmax?: number,
  mgrbAC?: number,
  mgrbAN?: number,
  zygosity?: Zygosity | null;
  cosmicId: string | null;
  researchCandidate: boolean | null;
  counts?: VariantCounts[];
  germlineCounts?: VariantCounts[];
}

export interface IGermlineSNV extends IReportableVariant, ICounts {
  variantId: string;
  biosampleId: string;
  geneId: number;
  gene: string;
  hgvs: string;
  chr: string;
  pos: number;
  snvRef: string;
  alt: string;
  pathclass: PathClass;
  platforms: Platforms;
  sampleCount: number;
  cancerTypes: number;
  geneLists?: string;
  cosmicId?: string;
  pecan?: boolean | null;
  zygosity?: Zygosity | null;
  altad: number;
  depth: number;
  genotype: string;
  consequence?: string;
  phenotype: string;
  impact: string;
  gnomadAFGenomePopmax?: number;
  mgrbAC?: number;
  mgrbAN?: number;
  failed?: boolean;
  heliumScore: number | null;
  heliumReason: string | null;
  researchCandidate: boolean | null;
}

export interface IReportableGermlineSNV extends IReportableVariant {
  variantId: string;
  sampleId: string;
  gene: string;
  chr: string;
  hgvs: string;
  altad: number;
  depth: number;
  pathclass: PathClass;
  genotype: string;
  zygosity?: Zygosity | null;
  somaticSnvZygosity?: string;
}

export type VariantZygosity = Pick<
  IReportableGermlineSNV, 'zygosity' | 'somaticSnvZygosity' | 'variantId'
>;
