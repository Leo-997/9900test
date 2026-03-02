import { IReportableVariant, type ICounts } from 'Models/Common/Common.model';
import type { VariantCounts } from '@zero-dash/types';
import { PaginationDTO } from '@zero-dash/types/dist/src/common/Pagination.types';
import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from 'Utilities/transformers/ToBoolean.util';
import {
  Pathclass, Platform, Zygosity,
} from '../Misc.model';

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
  sampleCount?: number;
  cancerTypes?: number;
  pathScore?: number;
  platforms?: Platform;
  rnaTpm?: number;
  rnaVaf?: string;
  rnaVafNo?: number;
  rnaAltad?: number;
  rnaDepth?: number;
  rnaImpact?: string;
  panelVaf?: number;
  adjustedVaf?: number;
  pecan?: boolean;
  pathclass?: Pathclass;
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

export class SNVVariantSeenInBiosampleDTO extends PaginationDTO {
  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    inGermline?: boolean;
}
