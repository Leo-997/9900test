import { geneListTypes, reportableNoteTypes } from '@/constants/Reports/geneLists';
import { IGene } from '../Common.types';
import { GenePanel } from '../Samples/Sample.types';

export type GeneListType = typeof geneListTypes[number];
export type ReportableNoteTypes = typeof reportableNoteTypes[number];

export interface IGeneListGene extends IGene {
  panels?: {
    panel: string,
    code: string,
  }[];
  isSomaticGermline?: boolean;
  note?: string;
}

export interface IGeneList {
  id: string;
  versionId: string;
  name: string;
  version: string;
  genePanel?: GenePanel;
  type: GeneListType;
  isHighRisk: boolean;
  isActive: boolean;
  titleAbbreviation: string;
  codeAbbreviation: string;
  geneCount: number | null;
  archiveNotes: string | null;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
  genes?: IGeneListGene[];
}

export interface IGeneListSearchResult extends IGeneList {
  geneMatchCount?: number;
}

export interface IGetGeneListFilters {
  search?: string;
  name?: string;
  version?: string;
  genePanel?: GenePanel;
  type?: GeneListType;
  isHighRisk?: boolean;
  isActive?: boolean | 'all';
  geneId?: number;
  includeGenes?: boolean;
  orderBy?: string[];
}

export interface ICreateGeneListBody {
  name: string;
  version: string;
  genePanel?: string;
  type: GeneListType;
  isHighRisk?: boolean;
  deactivateOldVersions?: boolean;
  geneIds: number[];
}

export interface IPanelReportableNote {
  id: number;
  genePanel: string;
  type: ReportableNoteTypes;
  content: string | null;
}

export interface IGetPanelReportableNotesQuery {
  genePanel?: string;
  type?: ReportableNoteTypes;
}

export interface IUpdatePanelReprotableNote {
  genePanel: string;
  type: ReportableNoteTypes;
  content: string;
}

export interface IUpdateGeneNote {
  geneId: number;
  note: string;
}
