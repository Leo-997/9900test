import { AxiosInstance } from 'axios';
import {
  IClinicalComment,
  IClinicalCommentThread,
  IClinicalCommentThreadsQuery,
  IClinicalCommentsQuery,
  ICreateClinicalCommentBody,
  ICreateClinicalCommentVersionBody,
  ICreateClinicalThreadBody,
  IUpdateClinicalCommentBody,
  IUpdateClinicalCommentVersionBody,
} from '../../../../../types/Comments/ClinicalComments.types';

export interface IClinicalCommentsClient {
  getCommentThreads: (
    query: IClinicalCommentThreadsQuery,
    signal?: AbortSignal,
  ) => Promise<IClinicalCommentThread[]>;
  getCommentThreadById: (
    threadId: string,
  ) => Promise<IClinicalCommentThread>;
  getComments: (
    query: IClinicalCommentsQuery,
    page?: number,
    limit?: number,
  ) => Promise<IClinicalComment[]>;
  getCommentsCount: (
    query: IClinicalCommentsQuery,
  ) => Promise<number>;
  getCommentsInThread: (
    threadId: string,
    query?: IClinicalCommentsQuery,
    page?: number,
    limit?: number,
  ) => Promise<IClinicalComment[]>;
  getCommentById: (
    commentId: string,
  ) => Promise<IClinicalComment>;
  createCommentThread: (
    body: ICreateClinicalThreadBody,
  ) => Promise<string>;
  deleteCommentThread: (
    threadId: string,
  ) => Promise<void>;
  createComment: (
    body: ICreateClinicalCommentBody,
  ) => Promise<string>;
  linkCommentToThread: (
    commentId: string,
    body: ICreateClinicalThreadBody,
  ) => Promise<void>;
  updateComment: (
    commentId: string,
    body: IUpdateClinicalCommentBody,
    threadId?: string,
  ) => Promise<string>;
  deleteComment: (
    commentId: string,
    threadId?: string,
  ) => Promise<void>;
  createCommentVersion: (
    commentId: string,
    body: ICreateClinicalCommentVersionBody,
  ) => Promise<string>;
  updateCommentVersion: (
    clinicalVersionId: string,
    versionId: string,
    body: IUpdateClinicalCommentVersionBody,
  ) => Promise<string>;
}

interface IMappedThreadsQuery extends Omit<IClinicalCommentThreadsQuery, 'genes' | 'geneMutations'> {
  geneIds?: number[];
  geneMutations?: string[];
}

interface IMappedCommentsQuery
extends IMappedThreadsQuery, Omit<IClinicalCommentThreadsQuery, 'genes' | 'geneMutations'> {}

export function createClinicalCommentsClient(
  instance: AxiosInstance,
): IClinicalCommentsClient {
  function mapThreadsQuery(query: IClinicalCommentThreadsQuery): IMappedThreadsQuery {
    const params = {
      ...query,
      geneIds: query.genes?.map((g) => g.geneId),
      geneMutations: query.geneMutations?.map((mutation) => `${mutation.variantType}:${mutation.gene}`),
    };
    delete params.genes;
    return params;
  }

  function mapCommentsQuery(query: IClinicalCommentsQuery): IMappedCommentsQuery {
    return {
      ...mapThreadsQuery(query),
    };
  }

  async function getCommentThreads(
    query: IClinicalCommentThreadsQuery,
    signal?: AbortSignal,
  ): Promise<IClinicalCommentThread[]> {
    const resp = await instance.get<IClinicalCommentThread[]>(
      '/clinical/comments/threads',
      {
        params: mapThreadsQuery(query),
        signal,
      },
    );
    return resp.data;
  }

  async function getCommentThreadById(
    threadId: string,
  ): Promise<IClinicalCommentThread> {
    const resp = await instance.get<IClinicalCommentThread>(`/clinical/comments/threads/${threadId}`);
    return resp.data;
  }

  async function getComments(
    query: IClinicalCommentsQuery,
    page?: number,
    limit?: number,
  ): Promise<IClinicalComment[]> {
    const resp = await instance.get<IClinicalComment[]>(
      '/clinical/comments',
      {
        params: {
          page,
          limit,
          ...mapCommentsQuery(query),
        },
      },
    );
    return resp.data;
  }

  async function getCommentsCount(
    query: IClinicalCommentsQuery,
  ): Promise<number> {
    const resp = await instance.get<number>(
      '/clinical/comments/count',
      { params: mapCommentsQuery(query) },
    );
    return resp.data;
  }

  async function getCommentsInThread(
    threadId: string,
    query?: IClinicalCommentsQuery,
    page?: number,
    limit?: number,
  ): Promise<IClinicalComment[]> {
    const resp = await instance.get<IClinicalComment[]>(
      `/clinical/comments/threads/${threadId}/comments`,
      {
        params: {
          page,
          limit,
          ...(query ? mapCommentsQuery(query) : {}),
        },
      },
    );
    return resp.data;
  }

  async function getCommentById(
    commentId: string,
  ): Promise<IClinicalComment> {
    const resp = await instance.get<IClinicalComment>(`/clinical/comments/${commentId}`);
    return resp.data;
  }

  async function createCommentThread(
    body: ICreateClinicalThreadBody,
  ): Promise<string> {
    const resp = await instance.post('/clinical/comments/thread', body);
    return resp.data;
  }

  async function deleteCommentThread(
    threadId: string,
  ): Promise<void> {
    await instance.delete(`/clinical/comments/thread/${threadId}`);
  }

  async function createComment(
    body: ICreateClinicalCommentBody,
  ): Promise<string> {
    const resp = await instance.post('/clinical/comments', body);
    return resp.data;
  }

  async function linkCommentToThread(
    commentId: string,
    body: ICreateClinicalThreadBody,
  ): Promise<void> {
    const resp = await instance.post(`/clinical/comments/threads/link/${commentId}`, body);
    return resp.data;
  }

  async function updateComment(
    commentId: string,
    body: IUpdateClinicalCommentBody,
    threadId?: string,
  ): Promise<string> {
    const resp = await instance.patch<string>(
      `/clinical/comments/${commentId}`,
      body,
      {
        params: {
          threadId,
        },
      },
    );
    return resp.data;
  }

  async function deleteComment(
    commentId: string,
    threadId?: string,
  ): Promise<void> {
    await instance.delete(`/clinical/comments/${commentId}`, { params: { threadId } });
  }

  async function createCommentVersion(
    commentId: string,
    body: ICreateClinicalCommentVersionBody,
  ): Promise<string> {
    const resp = await instance.post(`/clinical/comments/${commentId}/versions`, body);
    return resp.data;
  }

  async function updateCommentVersion(
    commentId: string,
    versionId: string,
    body: IUpdateClinicalCommentVersionBody,
  ): Promise<string> {
    const resp = await instance.patch<string>(
      `/clinical/comments/${commentId}/versions/${versionId}`,
      body,
    );
    return resp.data;
  }

  return {
    getCommentThreads,
    getCommentThreadById,
    getComments,
    getCommentsCount,
    getCommentsInThread,
    getCommentById,
    createCommentThread,
    deleteCommentThread,
    createComment,
    linkCommentToThread,
    updateComment,
    deleteComment,
    createCommentVersion,
    updateCommentVersion,
  };
}
