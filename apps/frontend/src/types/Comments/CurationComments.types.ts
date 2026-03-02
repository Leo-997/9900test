import {
  curationCommentTypes, curationThreadEntityTypes, curationThreadTypes,
  germlineCommentTypes,
  molecularCommentTypes,
} from '../../constants/Curation/comments';
import { IGene } from '../Common.types';
import { IEvidenceLink } from '../Evidence/Evidences.types';
import { ISortOptions } from '../Search.types';
import { ICurationTherapy } from '../Therapies/CurationTherapies.types';
import { IRelatedThread } from './CommonComments.types';

export type CurationThreadTypes = typeof curationThreadTypes[number];
export type CurationThreadEntityTypes = typeof curationThreadEntityTypes[number];
export type CurationCommentTypes = typeof curationCommentTypes[number];
export type MolecularCommentTypes = typeof molecularCommentTypes[number];
export type GermlineCommentTypes = typeof germlineCommentTypes[number];
export type CurationReportCommentTypes = Extract<typeof curationThreadTypes[number], 'MOLECULAR' | 'GERMLINE'>;

export interface ICommentVersion {
  id: string;
  commentId: string;
  comment: string;
  createdAt?: string;
  createdBy?: string;
}

export interface ICurationCommentThreadBase {
  id: string;
  type: CurationThreadTypes;
  analysisSetId: string;
  biosampleId: string;
  sequencedEvent: string;
  entityId: string | null;
  entityType: CurationThreadEntityTypes | null;
  comments?: ICurationComment[];
}

export interface ICurationCommentThread extends ICurationCommentThreadBase {
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface ICurationComment {
  id: string;
  versions: ICommentVersion[];
  type: CurationCommentTypes;
  originalThreadType: CurationThreadTypes;
  isHiddenInArchive: boolean;
  isHiddenInThread?: boolean;
  reportOrder?: number | null;
  reportLineBreak?: boolean;
  thread?: ICurationCommentThread;
  countEntities?: number | null;
  countSamples?: number | null;
  evidence?: IEvidenceLink[];
  therapies?: ICurationTherapy[];
  relatedThreads?: IRelatedThread<CurationThreadEntityTypes>[]; // all threads where comment is used
  createdAt?: string;
  createdBy?: string;
  originalCreatedAt: string;
  originalCreatedBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface ICurationCommentWithBody extends ICurationComment {
  comment: string;
}

export type ReportCurationComment = Pick<ICurationCommentWithBody, 'comment' | 'reportLineBreak' | 'reportOrder'>;

export interface ICurationCommentThreadsQuery {
  analysisSetIds?: string[];
  biosampleIds?: string[];
  entityId?: string;
  entityType?: CurationThreadEntityTypes[];
  threadType?: CurationThreadTypes[];
  genes?: IGene[];
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  zero2FinalDiagnosis?: string[];
  includeComments?: boolean;
}

export interface ICurationCommentsQuery
extends ICurationCommentThreadsQuery, ISortOptions {
  searchQuery?: string;
  type?: CurationCommentTypes[];
  isHiddenInArchive?: boolean;
  isHiddenInThread?: boolean;
}

export interface ICreateCurationThreadBody {
  threadType: CurationThreadTypes;
  analysisSetId: string;
  biosampleId?: string;
  entityId?: string;
  entityType?: CurationThreadEntityTypes;
}

export interface ICreateCurationCommentBody extends ICreateCurationThreadBody {
  comment: string;
  type: CurationCommentTypes;
  isHidden?: boolean;
  reportOrder?: number;
}

export interface IUpdateCurationCommentBody {
  comment?: string;
  type?: CurationCommentTypes;
  isHidden?: boolean;
  reportOrder?: number | null;
  reportLineBreak?: boolean;
}
