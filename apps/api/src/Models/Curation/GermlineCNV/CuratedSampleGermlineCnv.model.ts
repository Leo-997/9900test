import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import type { VariantCounts } from '@zero-dash/types';
import { Pathclass, Platform } from '../Misc.model';

export interface IGermlineCnv extends IReportableVariant, ICounts {
  variantId: number;
  geneId: number;
  gene: string;
  biosampleId: string;
  chromosome: string;
  cytoband: string;
  averageCN: number;
  cnType: string;
  prism: string;
  platform: Platform;
  pathclass: Pathclass;
  pathscore: number;
  minCN: number;
  maxCN: number;
  researchCandidate: boolean | null;
  counts?: VariantCounts[];
}
