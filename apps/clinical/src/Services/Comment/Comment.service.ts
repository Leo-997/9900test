import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  type HttpException,
} from '@nestjs/common';
import {
  ICreateCommentBody,
  ICreateCommentThreadBody,
  ICreateCommentVersionBody,
  IUpdateCommentBody,
  IUpdateCommentVersionBody,
} from 'Models/Comment/CommentBody.model';
import { ICommentsQuery, ICommentThreadQuery, ICommentThreadsQuery } from 'Models/Comment/CommentQuery.model';
import type { Knex } from 'knex';
import { CommentClient } from '../../Clients';
import {
  IComment,
  ICommentThread, IUserWithMetadata,
} from '../../Models';
import { EvidenceService } from '../Evidence/Evidence.service';
import { SampleService } from '../Sample/Sample.service';

@Injectable()
export class CommentService {
  constructor(
    @Inject(CommentClient) private readonly commentClient: CommentClient,
    @Inject(EvidenceService) private readonly evidenceService: EvidenceService,
    @Inject(SampleService) private readonly sampleService: SampleService,
  ) { }

  public async getCommentThreads(
    query: ICommentThreadsQuery,
    user: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    const threads = await this.commentClient.getCommentThreads(query, user);
    return Promise.all(threads.map(async (thread) => ({
      ...thread,
      comments: (await this.getCommentsInThread(thread.id, query, user))
        .map((comment) => ({
          ...comment,
          thread,
        })),
    })));
  }

  public async getCommentThreadById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<ICommentThread> {
    const thread = await this.commentClient.getCommentThreadById(id, user);
    if (!thread) {
      throw new BadRequestException('Thread no found');
    }

    return {
      ...thread,
      comments: (await this.commentClient.getCommentsInThread(thread.id, user))
        .map((comment) => ({
          ...comment,
          thread,
        })),
    };
  }

  public async getComments(
    query: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    const comments = await this.commentClient.getComments(query, user);
    return Promise.all(comments.map((c) => this.hydrateComment(c, user)));
  }

  public async getCommentsCount(
    query: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    return this.commentClient.getCommentsCount(query, user);
  }

  public async getCommentsInThread(
    threadId: string,
    query: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    const comments = await this.commentClient.getCommentsInThread(threadId, user, query);
    return Promise.all(comments.map((c) => this.hydrateComment(c, user)));
  }

  public async getCommentById(
    id: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    return this.commentClient.getCommentById(
      id,
      user,
      trx,
    )
      .then((c) => this.hydrateComment(c, user, trx));
  }

  private async hydrateComment(
    comment: IComment,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    if (!comment) {
      return comment;
    }

    return {
      ...comment,
      versions: await this.commentClient.getCommentVersions(comment.id, trx),
      evidence: (await this.evidenceService.getEvidence({
        entityTypes: ['COMMENT'],
        entityIds: [comment.id],
      }, user)),
      relatedThreads: await this.commentClient.getThreadsByCommentId(
        comment.id,
        user,
        trx,
      ),
    };
  }

  public async createCommentThread(
    body: ICreateCommentThreadBody,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    // only create if the user can access the clinical version
    const version = await this.sampleService.getClinicalVersion(
      currentUser,
      body.clinicalVersionId,
      undefined,
      true, // needs write access
    );
    if (!version) {
      throw new BadRequestException('Could not find clinical version.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      const commentId = await this.commentClient.createThread(body, currentUser);
      await trx.commit();
      return commentId;
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not create comment thread.');
    }
  }

  public async deleteCommentThread(
    id: string,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    // only delete if you can access the thread
    const thread = await this.getCommentThreadById(id, currentUser);
    if (!thread) {
      throw new BadRequestException('Could not find comment thread.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      await this.commentClient.deleteCommentThread(id, currentUser);
      await trx.commit();
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not delete comment thread.');
    }
  }

  public async createComment(
    body: ICreateCommentBody,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    // only create the comment if you can access the thread
    const trx = await this.commentClient.getTransaction();
    try {
      const commentId = await this.commentClient.createComment(body, currentUser, trx);
      // check if after creating the comment, we can fetch the comment
      const comment = await this.getCommentById(commentId, currentUser, trx);
      if (!comment) {
        throw new ForbiddenException();
      }
      await trx.commit();
      return commentId;
    } catch (e) {
      await trx.rollback();
      if ((e as HttpException).getStatus && e.getStatus() === 403) {
        throw e;
      }
      throw new BadRequestException();
    }
  }

  public async createCommentVersion(
    commentId: string,
    body: ICreateCommentVersionBody,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    // only create the version if you can access the comment
    const comment = await this.getCommentById(commentId, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      const versionId = await this.commentClient.createCommentVersion(commentId, body, currentUser);
      await trx.commit();
      return versionId;
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not create comment');
    }
  }

  public async linkCommentToThread(
    commentId: string,
    body: ICreateCommentThreadBody,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const comment = await this.getCommentById(commentId, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    const [thread] = await this.getCommentThreads(
      {
        clinicalVersionId: body.clinicalVersionId,
        threadType: body.threadType ? [body.threadType] : undefined,
        entityId: body.entityId,
        entityType: body.entityType ? [body.entityType] : undefined,
      },
      currentUser,
    );
    if (!thread) {
      throw new BadRequestException('Could not find comment thread.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      await this.commentClient.linkCommentToThread(
        commentId,
        body,
        currentUser,
        trx,
      );
      await trx.commit();
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not link comment to thread, invalid body or comment id');
    }
  }

  public async updateComment(
    id: string,
    body: IUpdateCommentBody,
    query: ICommentThreadQuery,
    currentUser: IUserWithMetadata,
  ): Promise<string> {
    const comment = await this.getCommentById(id, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    if (Object.values(body).every((v) => v === undefined)) {
      throw new BadRequestException('At least one value must be set in the body to update');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      const newCommentId = await this.commentClient.updateComment(
        id,
        body,
        query,
        currentUser,
        trx,
      );
      await trx.commit();
      return newCommentId;
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not update comment, please try again');
    }
  }

  public async updateCommentVersion(
    commentId: string,
    versionId: string,
    body: IUpdateCommentVersionBody,
    user: IUserWithMetadata,
  ): Promise<void> {
    const comment = await this.getCommentById(commentId, user);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      await this.commentClient.updateCommentVersion(versionId, body);
      await trx.commit();
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not create comment');
    }
  }

  public async deleteComment(
    id: string,
    query: ICommentThreadQuery,
    currentUser: IUserWithMetadata,
  ): Promise<void> {
    const comment = await this.getCommentById(id, currentUser);
    if (!comment) {
      throw new BadRequestException('Could not find comment.');
    }
    const trx = await this.commentClient.getTransaction();
    try {
      await this.commentClient.deleteComment(id, query, currentUser, trx);
      await trx.commit();
    } catch {
      await trx.rollback();
      throw new BadRequestException('Could not delete comment, please try again');
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
    return this.commentClient.keepLatestVersion(commentId);
  }

  public async cleanupOldRecords(
    retentionDays: number,
    compareColumn: string,
    logger: Logger,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldCommentIds = await this.commentClient.getOldComments(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldCommentIds.length} old comments to delete`);

    const oldCommentThreadIds = await this.commentClient.getOldCommentThreads(
      cutoffDate,
      compareColumn,
    );
    logger.log(`Found ${oldCommentThreadIds.length} old comment threads to delete`);

    if (oldCommentIds.length === 0 && oldCommentThreadIds.length === 0) {
      return 0;
    }

    const commentsDeleted = await this.deleteOldComments(oldCommentIds, logger);
    const threadsDeleted = await this.deleteOldCommentThreads(
      oldCommentThreadIds,
      logger,
    );
    const totalDeleted = commentsDeleted + threadsDeleted;

    logger.log(`Total records deleted: ${totalDeleted}`);
    return totalDeleted;
  }

  private async deleteOldComments(
    commentIds: string[],
    logger: Logger,
  ): Promise<number> {
    let deleted = 0;

    logger.log(`Deleting old comment and related records of comments ${commentIds.join(', ')}`);
    const trx = await this.commentClient.getTransaction();
    try {
      const versionsDeleted = await this.commentClient.deleteCommentVersionsByCommentIds(
        commentIds,
        trx,
      );
      const xrefDeleted = await this.commentClient.deleteXrefByCommentIds(
        commentIds,
        trx,
      );
      const commentsDeleted = await this.commentClient.permanentlyDeleteComment(
        commentIds,
        trx,
      );
      await trx.commit();
      deleted += versionsDeleted + xrefDeleted + commentsDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during comment cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    logger.log(`Deleted ${deleted} old comments and related records`);
    return deleted;
  }

  private async deleteOldCommentThreads(
    threadIds: string[],
    logger: Logger,
  ): Promise<number> {
    let deleted = 0;

    logger.log(`Deleting old comment thread and related records: threadId=${threadIds.join(', ')}`);
    const trx = await this.commentClient.getTransaction();
    try {
      const xrefDeleted = await this.commentClient.deleteXrefByThreadIds(
        threadIds,
        trx,
      );
      const threadsDeleted = await this.commentClient.permanentlyDeleteThreads(
        threadIds,
        trx,
      );
      await trx.commit();
      deleted += xrefDeleted + threadsDeleted;
    } catch (error) {
      await trx.rollback();
      logger.error(
        `Error during comment thread cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    logger.log(`Deleted ${deleted} old comment threads and related records`);
    return deleted;
  }
}
