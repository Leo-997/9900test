import { ICounts, IReportableVariant } from 'Models/Common/Common.model';
import { Pathclass, Platform } from '../Misc.model';

export interface ISomaticCnv extends IReportableVariant, ICounts {
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
  cnType: string;
  prism: string;
  platform: Platform;
  rnaTpm: number;
  rnaMedianTpm: number;
  rnaZScore: number;
  fc: number;
  pathclass: Pathclass;
  heliumScore: number
  heliumBreakdown: string;
  researchCandidate: boolean | null;
}
