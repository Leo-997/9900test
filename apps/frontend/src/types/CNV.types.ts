import type { VariantCounts } from '@zero-dash/types';
import { cnvCnTypes } from '../constants/Curation/cnv';
import {
  ICounts,
  IReportableVariant,
  ISummary,
  PathClass,
  Platforms,
} from './Common.types';

export type IFilterImportance = 'high' | 'mediumhigh' | 'mediumlow' | 'low';

export type CNVCNType = typeof cnvCnTypes[number];

export interface ICNVSummary {
  copyNumber: ISummary;
  zScore: ISummary;
}

export interface ISomaticCNV extends IReportableVariant, ICounts {
  biosampleId: string;
  variantId: number;
  geneId: number;
  gene: string;
  chromosome: string;
  cytoband: string;
  averageCN: number;
  minCn: number;
  maxCn: number;
  minMinorAlleleCn: number | null;
  cnType: CNVCNType | null;
  prism: string;
  platform: Platforms;
  rnaTpm: number;
  rnaMedianTpm: number;
  rnaZScore: number;
  fc: number;
  pathclass: PathClass;
  heliumScore: number
  heliumBreakdown: string;
  researchCandidate: boolean | null;
}

export interface IUpdateCNVBody extends Partial<IReportableVariant> {
  pathclass?: PathClass;
  cnType?: CNVCNType;
  researchCandidate?: boolean | null;
}

export interface IGermlineCNV extends IReportableVariant, ICounts {
  variantId: number;
  geneId: number;
  gene: string;
  biosampleId: string;
  chromosome: string;
  cytoband: string;
  averageCN: number;
  cnType: CNVCNType;
  prism: string;
  platform: Platforms;
  pathclass: PathClass;
  pathscore: number;
  minCN: number;
  maxCN: number;
  researchCandidate: boolean | null;
  counts?: VariantCounts[];
}

export type CNVVariants = ISomaticCNV | IGermlineCNV;
