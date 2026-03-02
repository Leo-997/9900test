import { AxiosInstance } from 'axios';
import {
  ICurationCommentThreadsQuery,
  ICurationCommentsQuery,
  ICreateCurationCommentBody,
  ICurationComment,
  ICurationCommentThread,
  IUpdateCurationCommentBody,
  ICreateCurationThreadBody,
} from '../../../../../types/Comments/CurationComments.types';
import { IUpdateReportOrder } from '../../../../../types/Comments/CommonComments.types';

export interface ICurationCommentsClient {
  getCommentThreads: (
    query: ICurationCommentThreadsQuery,
    signal?: AbortSignal,
  ) => Promise<ICurationCommentThread[]>;
  getCommentThreadById: (id: string) => Promise<ICurationCommentThread>;
  getComments: (
    query: ICurationCommentsQuery,
    page?: number,
    limit?: number,
  ) => Promise<ICurationComment[]>;
  getCommentsCount: (query: ICurationCommentsQuery) => Promise<number>;
  getCommentsInThread: (
    threadId: string,
    query?: ICurationCommentsQuery,
    page?: number,
    limit?: number,
  ) => Promise<ICurationComment[]>;
  getCommentById: (id: string) => Promise<ICurationComment>;
  createComment: (body: ICreateCurationCommentBody) => Promise<string>;
  linkCommentToThread: (commentId: string, body: ICreateCurationThreadBody) => Promise<void>;
  updateComment: (
    id: string,
    body: IUpdateCurationCommentBody,
    threadId?: string,
  ) => Promise<string>;
  updateCommentReportOrder: (body: IUpdateReportOrder) => Promise<void>;
  deleteComment: (id: string, threadId?: string) => Promise<void>;
}

interface IMappedThreadsQuery extends Omit<ICurationCommentThreadsQuery, 'genes'> {
  genes?: number[];
}

interface IMappedCommentsQuery
extends IMappedThreadsQuery, Omit<ICurationCommentThreadsQuery, 'genes'> {}

export function createCurationCommentsClient(
  instance: AxiosInstance,
): ICurationCommentsClient {
  function mapThreadsQuery(query: ICurationCommentThreadsQuery): IMappedThreadsQuery {
    return {
      ...query,
      genes: query.genes?.map((g) => g.geneId),
    };
  }

  function mapCommentsQuery(query: ICurationCommentsQuery): IMappedCommentsQuery {
    return {
      ...mapThreadsQuery(query),
    };
  }

  async function getCommentThreads(
    query: ICurationCommentThreadsQuery,
    signal?: AbortSignal,
  ): Promise<ICurationCommentThread[]> {
    const resp = await instance.post<ICurationCommentThread[]>(
      '/comments/threads',
      mapThreadsQuery(query),
      { signal },
    );
    return resp.data;
  }

  async function getCommentThreadById(id: string): Promise<ICurationCommentThread> {
    const resp = await instance.get<ICurationCommentThread>(`/comments/threads/${id}`);
    return resp.data;
  }

  async function getComments(
    query: ICurationCommentsQuery,
    page?: number,
    limit?: number,
  ): Promise<ICurationComment[]> {
    const resp = await instance.post<ICurationComment[]>('/comments/get-all', {
      page,
      limit,
      ...mapCommentsQuery(query),
    });
    return resp.data;
  }

  async function getCommentsCount(query: ICurationCommentsQuery): Promise<number> {
    const resp = await instance.post<number>(
      '/comments/count',
      mapCommentsQuery(query),
    );
    return resp.data;
  }

  async function getCommentsInThread(
    threadId: string,
    query?: ICurationCommentsQuery,
    page?: number,
    limit?: number,
  ): Promise<ICurationComment[]> {
    const resp = await instance.post<ICurationComment[]>(
      `comments/threads/${threadId}/comments`,
      {
        page,
        limit,
        ...(query ? mapCommentsQuery(query) : {}),
      },
    );
    return resp.data;
  }

  async function getCommentById(id: string): Promise<ICurationComment> {
    const resp = await instance.get<ICurationComment>(`/comments/${id}`);
    return resp.data;
  }

  async function createComment(body: ICreateCurationCommentBody): Promise<string> {
    const resp = await instance.post('/comments', body);
    return resp.data;
  }

  async function linkCommentToThread(
    commentId: string,
    body: ICreateCurationThreadBody,
  ): Promise<void> {
    const resp = await instance.post(`/comments/threads/link/${commentId}`, body);
    return resp.data;
  }

  async function updateComment(
    id: string,
    body: IUpdateCurationCommentBody,
    threadId?: string,
  ): Promise<string> {
    const resp = await instance.patch(`/comments/${id}`, body, { params: { threadId } });
    return resp.data;
  }

  async function updateCommentReportOrder(body: IUpdateReportOrder): Promise<void> {
    await instance.put('/comments/report-order', body);
  }

  async function deleteComment(id: string, threadId?: string): Promise<void> {
    await instance.delete(`/comments/${id}`, { params: { threadId } });
  }

  return {
    getCommentThreads,
    getCommentThreadById,
    getComments,
    getCommentsCount,
    getCommentsInThread,
    getCommentById,
    createComment,
    linkCommentToThread,
    updateComment,
    updateCommentReportOrder,
    deleteComment,
  };
}
