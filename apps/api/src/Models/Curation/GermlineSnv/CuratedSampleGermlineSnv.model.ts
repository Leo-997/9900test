import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import {
  Pathclass, Platform, Zygosity,
} from '../Misc.model';

export interface IGermlineSnv extends IReportableVariant, ICounts {
  variantId: string;
  biosampleId: string;
  geneId: number;
  gene: string;
  hgvs: string;
  chr: string;
  pos: number;
  snvRef: string;
  alt: string;
  pathclass: Pathclass;
  platforms: Platform;
  sampleCount: number;
  cancerTypes: number;
  geneLists?: string;
  cosmicId?: string;
  pecan?: boolean;
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
  variantId: number;
  biosampleId: string;
  gene: string;
  chr: string;
  hgvs: string;
  altad: number;
  depth: number;
  pathclass: Pathclass;
  genotype: string;
}

export interface IGermlineSnvUpdatableFields extends IReportableVariant {
  variantId: string;
  zygosity?: Zygosity | null;
  pathclass: Pathclass | null;
  phenotype: string | null;
  researchCandidate: boolean | null;
}

export type IGermlineSnvCounts = Pick<
  IGermlineSnv,
  'variantId'
  | 'cancerTypes'
  | 'sampleCount'
  | 'reportedCount'
  | 'targetableCount'
>;
