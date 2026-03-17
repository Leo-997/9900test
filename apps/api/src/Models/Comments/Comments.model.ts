import { commentTypes, threadEntityTypes, threadTypes } from 'Constants/Comments/Comments.constants';
import { IEvidence } from 'Models/Evidence/Evidence.model';

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
}

export interface IComment {
  id: string;
  type: CommentTypes;
  versions?: ICommentVersion[];
  originalThreadType: ThreadTypes;
  isHiddenInArchive: boolean;
  isHiddenInThread?: boolean;
  reportOrder?: number | null;
  reportLineBreak?: boolean;
  countEntities?: number | null;
  countSamples?: number | null;
  evidence?: IEvidence[];
  relatedThreads?: IRelatedThread[];
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
  analysisSetId: string;
  biosampleId: string | null;
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
