import { clinicalCommentTypes, clinicalThreadEntityTypes, clinicalThreadTypes } from '../../constants/Clinical/comments';
import { IGene, IGeneMutation } from '../Common.types';
import { IEvidenceLink } from '../Evidence/Evidences.types';
import { ReportType } from '../Reports/Reports.types';
import { ISortOptions } from '../Search.types';
import { ILinkedTherapy, IRelatedThread } from './CommonComments.types';

export type ClinicalThreadTypes = typeof clinicalThreadTypes[number];
export type ClinicalThreadEntityTypes = typeof clinicalThreadEntityTypes[number];
export type ClinicalCommentTypes = typeof clinicalCommentTypes[number];

export interface ICommentVersion {
  id: string;
  commentId: string;
  comment: string;
  createdAt?: string;
  createdBy?: string;
}

export interface IClinicalCommentThreadBase {
  id: string;
  type: ClinicalThreadTypes;
  clinicalVersionId: string;
  entityId: string | null;
  entityType: ClinicalThreadEntityTypes | null;
  comments?: IClinicalComment[];
}

export interface IClinicalCommentThread extends IClinicalCommentThreadBase {
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface IClinicalComment {
  id: string;
  type: ClinicalCommentTypes;
  isHiddenInArchive: boolean;
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  reportOrder?: number | null;
  countEntities?: number | null;
  countClinicalVersions?: number | null;
  thread?: IClinicalCommentThread;
  versions: ICommentVersion[];
  evidence?: IEvidenceLink[];
  therapy?: ILinkedTherapy[];
  relatedThreads?: IRelatedThread<ClinicalThreadEntityTypes>[]; // all threads where comment is used
  createdAt?: string;
  createdBy?: string;
  originalCreatedAt: string;
  originalCreatedBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface IClinicalCommentWithBody extends IClinicalComment {
  comment: string;
}

export interface ISlideComment extends IClinicalCommentWithBody {
  entityTitle?: string;
  index?: number;
}

export interface ICommentURL {
  slideIndex: string;
}

export interface ICreateClinicalThreadBody {
  threadType: ClinicalThreadTypes;
  clinicalVersionId: string;
  entityId?: string;
  entityType?: ClinicalThreadEntityTypes;
}

export interface ICreateClinicalCommentBody {
  comment: string;
  type: ClinicalCommentTypes;
  isHiddenInArchive?: boolean;
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  reportOrder?: number;
  // create the comment and thread at once
  thread?: ICreateClinicalThreadBody;
  // thread is created, just create and add the comment to the thread
  threadId?: string;
}

export interface IUpdateClinicalCommentBody {
  comment?: string;
  type?: ClinicalCommentTypes;
  isHidden?: boolean;
  isResolved?: boolean;
  reportOrder?: number | null;
}

export interface IClinicalCommentThreadsQuery {
  clinicalVersionId?: string;
  entityId?: string;
  entityType?: ClinicalThreadEntityTypes[];
  threadType?: ClinicalThreadTypes[];
  interpretationReportType?: ReportType[]
  zero2Category?: string[];
  zero2Subcat1?: string[];
  zero2Subcat2?: string[];
  genes?: IGene[];
  geneMutations?: IGeneMutation[];
  classifiers?: string[];
  zero2FinalDiagnosis?: string[];
  includeComments?: boolean;
}

export interface IClinicalCommentsQuery extends IClinicalCommentThreadsQuery, ISortOptions {
  searchQuery?: string;
  type?: ClinicalCommentTypes[];
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  isHiddenInArchive?: boolean;
}

export interface ICreateClinicalCommentVersionBody {
  comment: string;
}

export interface IUpdateClinicalCommentVersionBody {
  comment?: string;
}
