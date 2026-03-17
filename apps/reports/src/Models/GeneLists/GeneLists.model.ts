import { Type } from 'class-transformer';
import {
    IsBoolean, IsIn, IsNumber, IsOptional, IsString,
    Matches,
    ValidateIf,
} from 'class-validator';
import { geneListSortCols, geneListTypes, reportableNoteTypes } from 'Constants/GeneLists/GeneLists.constant';
import { ToBoolean } from 'Utils/Transformers/ToBoolean.util';
import { IPagination, PaginationDTO } from '../Common/Pagination.model';

export type GeneListType = typeof geneListTypes[number];
export type ReportableNoteTypes = typeof reportableNoteTypes[number];
export type GeneListSortCols = typeof geneListSortCols[number];

export interface IGene {
  geneId: number;
  gene?: string;
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
  genePanel: string;
  type: GeneListType;
  isHighRisk: boolean;
  isActive: boolean;
  titleAbbreviation: string;
  codeAbbreviation: string;
  geneCount: number;
  reportableCytogenetics: string | null;
  reportableRNAExpressions: string | null;
  archiveNotes: string | null;
  updatedAt?: string;
  updatedBy?: string;
  createdAt?: string;
  createdBy?: string;
  genes?: IGene[];
}

export interface IGetGeneListFilters extends IPagination {
  search?: string;
  name?: string;
  version?: string;
  genePanel?: string;
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

export class GetGeneListFiltersDTO extends PaginationDTO implements IGetGeneListFilters {
  @IsOptional()
  @IsString()
    search?: string;

  @IsOptional()
  @IsString()
    name?: string;

  @IsOptional()
  @IsString()
    version?: string;

  @IsOptional()
  @IsString()
    genePanel?: string;

  @IsOptional()
  @IsIn(geneListTypes)
    type?: GeneListType;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHighRisk?: boolean;

  @IsOptional()
  @ValidateIf((o, v) => v !== 'all')
  @IsBoolean()
  @ToBoolean()
    isActive?: boolean | 'all';

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    includeGenes?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
    geneId?: number;

  @IsOptional()
  @IsString({ each: true })
  @Matches(
    `^(${geneListSortCols.join('|')})(:(asc|desc))?$`,
    '',
    {
      each: true,
      message: `Each sort string must be one of ${geneListSortCols.join(', ')} optionally followed by ":(asc|desc)"`,
    },
  )
    orderBy?: string[];
}

export class CreateGeneListBodyDTO implements ICreateGeneListBody {
  @IsString()
    name: string;

  @IsString()
    version: string;

  @IsOptional()
  @IsString()
    genePanel?: string;

  @IsIn(geneListTypes)
    type: GeneListType;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    isHighRisk?: boolean;

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
    deactivateOldVersions?: boolean;

  @IsNumber({}, { each: true })
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

export class GetPanelReportableNotesDTO implements IGetPanelReportableNotesQuery {
  @IsOptional()
  @IsString()
    genePanel?: string;

  @IsOptional()
  @IsIn(reportableNoteTypes)
    type?: ReportableNoteTypes;
}

export interface IUpdatePanelReprotableNote {
  genePanel: string;
  type: ReportableNoteTypes;
  content: string;
}

export class UpdatePanelReprotableNoteDTO implements IUpdatePanelReprotableNote {
  @IsString()
    genePanel: string;

  @IsIn(reportableNoteTypes)
    type: ReportableNoteTypes;

  @IsString()
    content: string;
}

export interface IUpdateGeneNote {
  geneId: number;
  note: string;
}

export class UpdateGeneNoteDTO implements IUpdateGeneNote {
  @IsNumber()
    geneId: number;

  @IsString()
    note: string;
}
