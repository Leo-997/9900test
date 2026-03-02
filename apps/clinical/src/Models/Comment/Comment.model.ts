import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comment/Comment.constant';
import { IEvidence } from '../Evidence/Evidence.model';
import { ReportType } from '../Reports/Reports.model';

export type ThreadTypes = typeof threadTypes[number];
export type ThreadEntityTypes = typeof threadEntityTypes[number];
export type CommentTypes = typeof commentTypes[number];

export interface ICommentVersion {
  id: string;
  commentId: string;
  comment: string;
  createdAt?: string;
  createdBy?: string;
}

export interface IRelatedThread {
  id: string;
  analysisSetId: string;
  patientId: string;
  entityType: ThreadEntityTypes;
  zero2FinalDiagnosis: string;
  interpretationReportType?: ReportType;
}

export interface IComment {
  id: string;
  type: CommentTypes;
  isHiddenInArchive: boolean;
  isHiddenInThread?: boolean;
  isResolved?: boolean;
  reportOrder?: number | null;
  countEntities?: number | null;
  countClinicalVersions?: number | null;
  thread?: ICommentThread;
  versions?: ICommentVersion[];
  relatedThreads?: IRelatedThread[];
  evidence?: IEvidence[];
  createdAt?: string;
  createdBy?: string;
  originalCreatedAt: string;
  originalCreatedBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface ICommentThreadBase {
  id: string;
  type: ThreadTypes;
  clinicalVersionId: string;
  entityId: string | null;
  entityType: ThreadEntityTypes | null;
}

export interface ICommentThread extends ICommentThreadBase {
  comments?: IComment[];
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}
