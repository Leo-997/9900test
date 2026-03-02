import {
  ForbiddenException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CommentsClient } from 'Clients/Comments/Comments.client';
import { Knex } from 'knex';
import { IComment, ICommentThread } from 'Models/Comments/Comments.model';
import {
  CreateCommentVersionBodyDTO,
  ICreateCommentBody,
  ICreateCommentThreadBody,
  IUpdateCommentBody,
  IUpdateReportOrder,
} from 'Models/Comments/CommentsBody.model';
import { ICommentsQuery, ICommentThreadQuery, ICommentThreadsQuery } from 'Models/Comments/CommentsQuery.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { EvidenceService } from 'Services/Evidence/Evidence.service';

@Injectable()
export class CommentsService {
  constructor(
    @Inject(CommentsClient) private readonly commentsClient: CommentsClient,
    @Inject(EvidenceService) private readonly evidenceService: EvidenceService,
  ) { }

  public async getCommentThreads(
    filters: ICommentThreadsQuery,
    user: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    const threads = await this.commentsClient.getCommentThreads(filters, user);
    return Promise.all(threads.map(async (thread) => ({
      ...thread,
      comments: await this.getCommentsInThread(thread.id, {}, user),
    })));
  }

  public async getCommentThreadById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<ICommentThread> {
    return this.commentsClient.getCommentThreadById(id, user);
  }

  public async getComments(
    filters: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    const comments = await this.commentsClient.getComments(filters, user);
    return this.hydrateComments(comments, user);
  }

  public async getCommentsCount(
    filters: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.commentsClient.getCommentsCount(filters, user);
  }

  public async getCommentsInThread(
    threadId: string,
    filters: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    const comments = await this.commentsClient.getCommentsInThread(threadId, filters, user);
    return this.hydrateComments(comments, user);
  }

  private async hydrateComments(
    comments: IComment[],
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment[]> {
    const allEvidence = await this.evidenceService.getEvidence(
      {
        entityTypes: ['COMMENT'],
        entityIds: comments.map((c) => c.id),
      },
      user,
      true,
    );

    return Promise.all(comments.map(async (comment) => {
      const relatedThreads = await this.commentsClient.getThreadsByCommentId(comment.id, user);
      return {
        ...comment,
        versions: await this.commentsClient.getCommentVersions(comment.id, trx),
        evidence: allEvidence.filter((e) => (
          e.entityId === comment.id
        )),
        relatedThreads,
        countEntities: (new Set(relatedThreads.map((t) => t.id))).size,
        countSamples: (new Set(relatedThreads.map((t) => t.analysisSetId))).size,
      };
    }));
  }

  public async moveCommentsToThread(
    oldThread: ICommentThreadsQuery,
    newThread: ICreateCommentThreadBody,
    currentUser: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<void> {
    return this.commentsClient.moveCommentsToThread(oldThread, newThread, currentUser, trx);
  }

  public async getCommentById(
    id: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    return this.commentsClient.getCommentById(id, user, trx)
      .then((comment) => this.hydrateComment(comment, user, false, trx));
  }

  private async hydrateComment(
    comment: IComment | undefined,
    user: IUserWithMetadata,
    includeThreads?: boolean,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    if (!comment) {
      return comment;
    }

    return {
      ...comment,
      versions: await this.commentsClient.getCommentVersions(comment.id, trx),
      evidence: (await this.evidenceService.getEvidence({
        entityTypes: ['COMMENT'],
        entityIds: [comment.id],
      }, user)),
      relatedThreads: includeThreads
        ? await this.commentsClient.getThreadsByCommentId(
          comment.id,
          user,
          trx,
        )
        : [],
    };
  }

  public async createComment(
    body: ICreateCommentBody,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    const trx = await this.commentsClient.getTransaction();
    try {
      const commentId = await this.commentsClient.createComment(body, currentUser);
      // check if after creating the comment, we can fetch the comment
      const comment = await this.getCommentById(commentId, currentUser, trx);
      if (!comment) {
        throw new ForbiddenException();
      }
      await trx.commit();
      return commentId;
    } catch {
      trx.rollback();
      throw new BadRequestException('');
    }
  }

  public async linkCommentToThread(
    commentId: string,
    body: ICreateCommentThreadBody,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    // Check that the comment exists, and that the user can see the comment
    const comment = await this.getCommentById(commentId, currentUser);
    if (!comment) {
      throw new BadRequestException('Comment not found please check the comment id');
    }
    const trx = await this.commentsClient.getTransaction();
    try {
      await this.commentsClient.linkCommentToThread(
        commentId,
        body,
        currentUser,
        trx,
      );
      trx.commit();
    } catch {
      trx.rollback();
      throw new BadRequestException('Could not link comment to thread, invalid body or comment id');
    }
  }

  public async updateComment(
    id: string,
    body: IUpdateCommentBody,
    query: ICommentThreadQuery,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one value must be set in the body to update');
    }
    const comment = await this.getCommentById(id, currentUser);
    if (!comment) {
      throw new BadRequestException('Comment not found please check the comment id');
    }
    if (query.threadId) {
      const thread = await this.getCommentThreadById(query.threadId, currentUser);
      if (!thread) {
        throw new BadRequestException('Thread not found please check the thread id');
      }
    }
    const trx = await this.commentsClient.getTransaction();
    try {
      const newCommentId = await this.commentsClient.updateComment(
        id,
        body,
        query,
        currentUser,
        trx,
      );
      trx.commit();
      return newCommentId;
    } catch {
      trx.rollback();
      throw new BadRequestException('Could not update comment, please try again');
    }
  }

  public async updateCommentReportOrder(
    body: IUpdateReportOrder,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    // Check that the user has access to the thread
    const comment = await this.getCommentThreadById(body.threadId, currentUser);
    if (!comment) {
      throw new BadRequestException('Comment thread not found please check the thread id');
    }
    const commentsInThread = await this.getCommentsInThread(
      body.threadId,
      {},
      currentUser,
    ).then((resp) => resp.map((c) => c.id));
    if (body.order.some((o) => !commentsInThread.includes(o.id))) {
      throw new BadRequestException('Provided comments are not in this thread');
    }
    return this.commentsClient.updateCommentReportOrder(body);
  }

  public async deleteComment(
    id: string,
    query: ICommentThreadQuery,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const comment = await this.getCommentById(id, currentUser);
    if (!comment) {
      throw new BadRequestException('Comment not found please check the comment id');
    }
    if (query.threadId) {
      const thread = await this.getCommentThreadById(query.threadId, currentUser);
      if (!thread) {
        throw new BadRequestException('Thread not found please check the thread id');
      }
    }
    const trx = await this.commentsClient.getTransaction();
    try {
      await this.commentsClient.deleteComment(id, query, currentUser, trx);
      trx.commit();
    } catch {
      trx.rollback();
      throw new BadRequestException('Could not delete comment, please try again');
    }
  }

  public async createCommentVersion(
    commentId: string,
    body: CreateCommentVersionBodyDTO,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    // only create the version if you can access the comment
    const comment = await this.getCommentById(commentId, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    const trx = await this.commentsClient.getTransaction();
    try {
      const versionId = await this.commentsClient.createCommentVersion(
        commentId,
        body,
        currentUser,
      );
      await trx.commit();
      return versionId;
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not create comment');
    }
  }

  public async keepLatestVersion(
    commentId: string,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const comment = await this.getCommentById(commentId, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    return this.commentsClient.keepLatestVersion(commentId);
  }

  public async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const commentsDeleted = await this.deleteOldComments(cutoffDate, compareColumn, logger);
    const threadsDeleted = await this.deleteOldCommentThreads(
      cutoffDate,
      compareColumn,
      logger,
    );
    const totalDeleted = commentsDeleted + threadsDeleted;

    logger.log(`Total records deleted: ${totalDeleted}`);
    return totalDeleted;
  }

  private async deleteOldComments(
    cutoffDate: Date,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const oldCommentIds = await this.commentsClient.getOldComments(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldCommentIds.length} old comments to delete`);
    if (oldCommentIds.length === 0) {
      return 0;
    }

    let deletedRecords = 0;
    logger.log(`Deleting old comment and related records: commentIds=${oldCommentIds.join(', ')}`);

    const trx = await this.commentsClient.getTransaction();
    try {
      const xrefDeleted = await this.commentsClient.deleteXrefByCommentIds(
        oldCommentIds,
        trx,
      );
      const commentsDeleted = await this.commentsClient.permanentlyDeleteComment(
        oldCommentIds,
        trx,
      );
      await trx.commit();
      deletedRecords += xrefDeleted + commentsDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error deleting comment: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return deletedRecords;
  }

  private async deleteOldCommentThreads(
    cutoffDate: Date,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const oldCommentThreadIds = await this.commentsClient.getOldCommentThreads(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldCommentThreadIds.length} old comment threads to delete`);

    if (oldCommentThreadIds.length === 0) {
      return 0;
    }

    let deletedRecords = 0;

    logger.log(`Deleting old comment thread and related records: threadId=${oldCommentThreadIds.join(', ')}`);
    const trx = await this.commentsClient.getTransaction();
    try {
      const xrefDeleted = await this.commentsClient.deleteXrefByThreadIds(
        oldCommentThreadIds,
        trx,
      );
      const threadsDeleted = await this.commentsClient.permanentlyDeleteThreads(
        oldCommentThreadIds,
        trx,
      );
      await trx.commit();
      deletedRecords += xrefDeleted + threadsDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error deleting comment thread: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return deletedRecords;
  }
}
