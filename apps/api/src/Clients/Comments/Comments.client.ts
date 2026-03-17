import { Inject, Injectable } from '@nestjs/common';
import { commentTypes } from 'Constants/Comments/Comments.constants';
import { Knex } from 'knex';
import {
  IComment, ICommentThread, ICommentVersion, IRelatedThread,
} from 'Models/Comments/Comments.model';
import {
  CreateCommentVersionBodyDTO,
  ICreateCommentBody,
  ICreateCommentThreadBody,
  IUpdateCommentBody,
  IUpdateCommentVersionBody,
  IUpdateReportOrder,
} from 'Models/Comments/CommentsBody.model';
import { ICommentsQuery, ICommentThreadQuery, ICommentThreadsQuery } from 'Models/Comments/CommentsQuery.model';
import { IUser, IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { withPagination } from 'Utilities/query/misc.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CommentsClient {
  private readonly commentThreadsTable = 'zcc_curation_comment_thread';

  private readonly commentsTable = 'zcc_curation_comment';

  private readonly commentsVersionTable = 'zcc_curation_comment_version';

  private readonly commentsThreadsXrefTable = 'zcc_curation_comment_thread_xref';

  private readonly snvTable = 'zcc_curated_snv';

  private readonly svTable = 'zcc_curated_sv';

  private readonly analysisSetTable = 'zcc_analysis_set';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) { }

  public async getCommentThreads(
    query: ICommentThreadsQuery,
    user: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    return this.selectCommentsThreadsBase(user)
      .modify(this.withThreadsFilters, query, this);
  }

  public getGeneThreadIds(genes: number[]): Knex.QueryBuilder {
    return this.knex.select('threads.id')
      .from({ threads: this.commentThreadsTable })
      .leftJoin({ snv: this.snvTable }, function snvJoinCondition() {
        this.on('threads.entity_id', 'snv.variant_id')
          .andOnIn('threads.entity_type', ['SNV', 'GERMLINE_SNV']);
      })
      .leftJoin({ sv: this.svTable }, function svJoinCondition() {
        this.on('threads.entity_id', 'sv.variant_id')
          .andOnIn('threads.entity_type', ['SV', 'GERMLINE_SV']);
      })
      .whereIn('snv.gene_id', genes)
      .orWhereIn('sv.start_gene_id', genes)
      .orWhereIn('sv.end_gene_id', genes)
      .orWhere(function otherVariantTypes() {
        this.whereIn('threads.entity_type', ['CNV', 'GERMLINE_CNV', 'RNA_SEQ'])
          .whereIn('threads.entity_id', genes);
      });
  }

  public async createThread(
    body: ICreateCommentThreadBody,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;

    await db.insert({
      id: uuid(),
      thread_type: body.threadType,
      analysis_set_id: body.analysisSetId,
      biosample_id: body.biosampleId,
      entity_id: body.entityId,
      entity_type: body.entityType,
      created_by: currentUser.id,
    })
      .into(this.commentThreadsTable)
      .onConflict(['thread_type', 'analysis_set_id', 'entity_id', 'entity_type'])
      .ignore();

    const id = await db.select('id')
      .from({ threads: this.commentThreadsTable })
      .modify(
        this.withThreadsFilters,
        {
          ...body,
          analysisSetIds: [body.analysisSetId],
          biosampleIds: body.biosampleId ? [body.biosampleId] : undefined,
          threadType: [body.threadType],
          entityType: [body.entityType],
        },
        this,
      )
      .first();

    return id.id;
  }

  public async getCommentThreadById(
    id: string,
    user: IUserWithMetadata,
  ): Promise<ICommentThread> {
    return this.selectCommentsThreadsBase(user)
      .where('threads.id', id)
      .first();
  }

  public async getComments(
    {
      page = 1,
      limit = 100,
      sortColumns,
      sortDirections,
      ...query
    }: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.selectCommentsBase(user)
      .modify(this.withCommentFilters, query, page, limit, this)
      .modify(this.withThreadsFilters, { ...query, threadType: undefined }, this)
      .modify(this.withCountSelect, this)
      .orderBy([
        ...(sortColumns || []).map((c, i) => ({
          column: this.commentsSortColumnMap(c),
          order: sortDirections[i],
        })),
      ])
      // order by 'type', as per order of appearance in commentTypes const(Comments.constants.ts)
      .orderByRaw(
        // Converting the array into a list of bindings as like ?,?,?...
        // Then passing in the values as a second argument to prevent SQL injection
        `field(type, ${Array(commentTypes.length).fill('?').join(',')})`,
        commentTypes,
      )
      // default sort most frequent used then newest
      .orderBy([
        {
          column: 'countEntities',
          order: 'desc',
        },
        {
          column: this.commentsSortColumnMap('Original Created At'),
          order: 'desc',
        },
      ]);
  }

  public async getCommentsCount(
    query: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.knex.count('* as count')
      .from(
        this.selectCommentsBase(user)
          .modify(this.withCommentFilters, query, undefined, undefined, this)
          .modify(this.withThreadsFilters, { ...query, threadType: undefined }, this)
          .groupBy('comments.id')
          .as('query'),
      )
      .first();

    return Number.parseInt(data.count.toString(), 10);
  }

  public async getCommentsInThread(
    threadId: string,
    {
      page = 1,
      limit = 100,
      sortColumns,
      sortDirections,
      ...query
    }: ICommentsQuery,
    user: IUserWithMetadata,
  ): Promise<IComment[]> {
    return this.selectCommentsBase(user, 'innerJoin')
      .where('xref.thread_id', threadId)
      .modify(this.withXrefSelect)
      .modify(this.withCommentFilters, query, page, limit, this)
      .modify(this.withXrefFilters, query)
      .orderBy([
        ...(sortColumns || []).map((c, i) => ({
          column: this.commentsSortColumnMap(c),
          order: sortDirections[i],
        })),
        // default sort newest to oldest
        {
          column: this.commentsSortColumnMap('Created At'),
          order: 'desc',
        },
      ]);
  }

  public async moveCommentsToThread(
    oldThread: ICommentThreadsQuery,
    newThread: ICreateCommentThreadBody,
    currentUser: IUserWithMetadata,
    trx: Knex.Transaction,
  ): Promise<void> {
    const threads = await this.getCommentThreads(oldThread, currentUser);
    if (threads.length) {
      // get comments in old thread
      const oldThreadObj = threads[0];
      const comments = await this.getCommentsInThread(oldThreadObj.id, oldThread, currentUser);
      // link old comments to new thread
      await Promise.all((comments.map((comment) => (
        this.linkCommentToThread(comment.id, newThread, currentUser, trx)
      ))));
      // remove comment from old thread
      await Promise.all((comments).map((comment) => (
        this.deleteComment(comment.id, { threadId: oldThreadObj.id }, currentUser, trx)
      )));
    }
  }

  public async getCommentById(
    id: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    return this.selectCommentsBase(user, 'leftJoin', trx)
      .modify(this.withCountSelect, this)
      .where('comments.id', id)
      .first();
  }

  public async createComment(
    body: ICreateCommentBody,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;
    const threadId = await this.createThread(body, currentUser, trx);

    // insert comment
    const commentId = uuid();
    await db.insert({
      id: commentId,
      type: body.type,
      original_thread_id: threadId,
      original_thread_type: body.threadType,
      is_hidden: body.isHiddenInArchive,
      created_by: currentUser.id,
    })
      .into(this.commentsTable);

    // create the first version of the comment
    await this.createCommentVersion(
      commentId,
      { comment: body.comment },
      currentUser,
      trx,
    );

    // insert link
    await db.insert({
      thread_id: threadId,
      comment_id: commentId,
      is_hidden: body.isHiddenInThread,
      report_order: body.reportOrder,
      created_by: currentUser.id,
    })
      .into(this.commentsThreadsXrefTable);

    return commentId;
  }

  public async linkCommentToThread(
    commentId: string,
    body: ICreateCommentThreadBody,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    const threadId = await this.createThread(body, currentUser, trx);
    // insert link
    await db.insert({
      thread_id: threadId,
      comment_id: commentId,
      report_order: null,
      created_by: currentUser.id,
    })
      .into(this.commentsThreadsXrefTable);
  }

  public async updateComment(
    id: string,
    body: IUpdateCommentBody,
    query: ICommentThreadQuery,
    currentUser: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;
    if (query.threadId) {
      // update the comment in this thread only
      // ie duplicate the comment and update that
      if (body.comment || body.type) {
        // get thread details
        const thread = await this.getCommentThreadById(query.threadId, currentUser);
        // get old comment details
        const oldComment = await this.getCommentById(id, currentUser);
        const oldVersions = await this.getCommentVersions(id);
        // remove comment from this thread
        await this.deleteComment(id, query, currentUser, trx);
        // create a new comment
        return this.createComment({
          threadType: thread.type,
          analysisSetId: thread.analysisSetId,
          biosampleId: thread.biosampleId,
          entityId: thread.entityId,
          entityType: thread.entityType,
          isHiddenInArchive: oldComment?.isHiddenInArchive,
          reportOrder: oldComment?.reportOrder,
          // updated fields
          comment: body.comment || oldVersions[0]?.comment,
          type: body.type || oldComment?.type,
          isHiddenInThread: body.isHidden,
        }, currentUser, trx);
      }

      // update comment in this thread
      // update the comment
      await db.update({
        is_hidden: body.isHidden,
        report_order: body.reportOrder,
        report_line_break: body.reportLineBreak,
      })
        .from(this.commentsThreadsXrefTable)
        .where('comment_id', id)
        .where('thread_id', query.threadId);

      return id;
    }

    if (body.comment) {
      await this.createCommentVersion(
        id,
        { comment: body.comment },
        currentUser,
        trx,
      );
    }

    if (body.type || body.isHidden !== undefined) {
      // update the comment everywhere
      await db.update({
        type: body.type,
        is_hidden: body.isHidden,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser.id,
      })
        .from(this.commentsTable)
        .where('id', id);
    }

    return id;
  }

  public async updateCommentReportOrder(
    body: IUpdateReportOrder,
  ): Promise<void> {
    return this.knex.transaction(async (trx) => {
      const promises: Knex.QueryBuilder[] = [];
      for (const order of body.order) {
        promises.push(
          trx.update({
            report_order: order.order,
          })
            .from(this.commentsThreadsXrefTable)
            .where('thread_id', body.threadId)
            .andWhere('comment_id', order.id),
        );
      }
      await Promise.all(promises);
    });
  }

  public async deleteComment(
    id: string,
    query: ICommentThreadQuery,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db.delete()
      .from(this.commentsThreadsXrefTable)
      .where('comment_id', id)
      .andWhere(function specificThread() {
        if (query.threadId) {
          this.andWhere('thread_id', query.threadId);
        }
      });

    // no thread provided, delete comment entirely
    if (!query.threadId) {
      await db.update({
        deleted_at: db.fn.now(),
        deleted_by: currentUser.id,
      })
        .where('id', id)
        .from(this.commentsTable);
    }
  }

  public async getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  public async getThreadsByCommentId(
    commentId: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IRelatedThread[]> {
    const db = trx ?? this.knex;

    return db
      .select({
        id: 'threads.id',
        analysisSetId: 'threads.analysis_set_id',
        patientId: 'analysis.patient_id',
        entityType: 'threads.entity_type',
        zero2FinalDiagnosis: 'analysis.zero2_final_diagnosis',
      })
      .from({ threads: this.commentThreadsTable })
      .modify(
        withAnalysisSet,
        'innerJoin',
        user,
        'threads.analysis_set_id',
        undefined,
        true,
      )
      .innerJoin(
        { xref: this.commentsThreadsXrefTable },
        'threads.id',
        'xref.thread_id',
      )
      .where('xref.comment_id', commentId);
  }

  public async getOldComments(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    const oldComments = await this.knex(this.commentsTable)
      .select('id')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate);

    return oldComments.map((comment) => comment.id);
  }

  public async getOldCommentThreads(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    const oldCommentThreads = await this.knex(this.commentThreadsTable)
      .select('id')
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate);

    return oldCommentThreads.map((commentThread) => commentThread.id);
  }

  public async permanentlyDeleteCommentThreads(
    deleteIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (deleteIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentsThreadsXrefTable)
      .whereIn('id', deleteIds)
      .delete();
  }

  public async permanentlyDeleteComment(
    deleteIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (deleteIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentsTable)
      .whereIn('id', deleteIds)
      .delete();
  }

  public async permanentlyDeleteThreads(
    threadIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (threadIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentThreadsTable)
      .whereIn('id', threadIds)
      .delete();
  }

  public async deleteXrefByCommentIds(
    commentIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (commentIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentsThreadsXrefTable)
      .whereIn('comment_id', commentIds)
      .delete();
  }

  public async deleteXrefByThreadIds(
    threadIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (threadIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentsThreadsXrefTable)
      .whereIn('thread_id', threadIds)
      .delete();
  }

  private selectCommentsThreadsBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    const analysisSets = this.knex
      .select('analysis.analysis_set_id')
      .modify(
        withAnalysisSet,
        'from',
        user,
        undefined,
        undefined,
        true,
      );

    const biosamples = this.knex
      .select('biosample.biosample_id')
      .modify(
        withBiosample,
        'from',
        user,
      );

    return this.knex.select({
      id: 'threads.id',
      type: 'threads.thread_type',
      analysisSetId: 'threads.analysis_set_id',
      biosampleId: 'threads.biosample_id',
      entityId: 'threads.entity_id',
      entityType: 'threads.entity_type',
      createdAt: 'threads.created_at',
      createdBy: 'threads.created_by',
      updatedAt: 'threads.updated_at',
      updatedBy: 'threads.updated_by',
      deletedAt: 'threads.deleted_at',
      deletedBy: 'threads.deleted_by',
    })
      .from({ threads: this.commentThreadsTable })
      .innerJoin(
        { analysis: this.analysisSetTable },
        'threads.analysis_set_id',
        'analysis.analysis_set_id',
      )
      .where(function applyAccessControl() {
        this.whereIn('threads.analysis_set_id', analysisSets)
          .orWhereIn('threads.biosample_id', biosamples);
      });
  }

  private withThreadsFilters(
    qb: Knex.QueryBuilder,
    query: ICommentThreadsQuery,
    // withThreadsFilters will be used with .modify
    // So 'this' inside this function will refer to the qb
    // passing the client as an argument to get around that
    commentsClient: CommentsClient,
  ): void {
    qb.where(function filters() {
      if (query.threadType && query.threadType.length > 0) {
        this.whereIn('threads.thread_type', query.threadType);
      }

      if (query.entityId) {
        this.andWhere('threads.entity_id', query.entityId);
      }

      if (query.entityType && query.entityType.length > 0) {
        this.whereIn('threads.entity_type', query.entityType);
      }

      if (query.analysisSetIds?.length) {
        this.whereIn('threads.analysis_set_id', query.analysisSetIds);
      }

      if (query.biosampleIds?.length) {
        this.whereIn('threads.biosample_id', query.biosampleIds);
      }

      if (query.genes && query.genes.length > 0) {
        this.whereIn('threads.id', commentsClient.getGeneThreadIds(query.genes));
      }

      if (query.zero2Category && query.zero2Category.length > 0) {
        this.whereIn('analysis.zero2_category', query.zero2Category);
      }

      if (query.zero2Subcat1 && query.zero2Subcat1.length > 0) {
        this.whereIn('analysis.zero2_subcategory1', query.zero2Subcat1);
      }

      if (query.zero2Subcat2 && query.zero2Subcat2.length > 0) {
        this.whereIn('analysis.zero2_subcategory2', query.zero2Subcat2);
      }

      if (query.zero2FinalDiagnosis && query.zero2FinalDiagnosis.length > 0) {
        this.whereIn('analysis.zero2_final_diagnosis', query.zero2FinalDiagnosis);
      }
    })
      .whereNull('threads.deleted_at');
  }

  private selectCommentsBase(
    user: IUserWithMetadata,
    joinType: 'innerJoin' | 'leftJoin' = 'leftJoin',
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder {
    const db = trx ?? this.knex;

    const threads = this.selectCommentsThreadsBase(user)
      .clearSelect()
      .select('threads.id');

    return db.select({
      id: 'comments.id',
      type: 'comments.type',
      originalThreadType: 'comments.original_thread_type',
      isHiddenInArchive: 'comments.is_hidden',
      originalCreatedAt: 'comments.created_at',
      originalCreatedBy: 'comments.created_by',
      updatedAt: 'comments.updated_at',
      updatedBy: 'comments.updated_by',
      deletedAt: 'comments.deleted_at',
      deletedBy: 'comments.deleted_by',
    })
      .from({ comments: this.commentsTable })
      // eslint-disable-next-line no-unexpected-multiline
      [joinType](
        { xref: this.commentsThreadsXrefTable },
        'comments.id',
        'xref.comment_id',
      )
      // eslint-disable-next-line no-unexpected-multiline
      [joinType](
        { threads: this.commentThreadsTable },
        'threads.id',
        'xref.thread_id',
      )
      // eslint-disable-next-line no-unexpected-multiline
      [joinType](
        { analysis: this.analysisSetTable },
        'threads.analysis_set_id',
        'analysis.analysis_set_id',
      )
      .where(function applyAccessControl() {
        this.whereIn('threads.id', threads)
          .orWhereIn('comments.original_thread_id', threads);
      });
  }

  private withCommentFilters(
    qb: Knex.QueryBuilder,
    query: ICommentsQuery,
    page?: number,
    limit?: number,
    commentsClient?: CommentsClient,
  ): void {
    const latestVersionsSubquery = commentsClient.knex
      .select('cv.comment_id', 'cv.comment')
      .from({ cv: commentsClient.commentsVersionTable })
      .join(
        commentsClient.knex
          .select('comment_id')
          .max('created_at as max_created_at')
          .from({ cv2: commentsClient.commentsVersionTable })
          .groupBy('comment_id')
          .as('latest_cv'),
        function joinLatest() {
          this.on('cv.comment_id', 'latest_cv.comment_id')
            .andOn('cv.created_at', 'latest_cv.max_created_at');
        },
      )
      .as('latest_comment');

    if (query.searchQuery) {
      qb.leftJoin(latestVersionsSubquery, 'latest_comment.comment_id', 'comments.id');
    }

    qb.where(function filters() {
      if (query.searchQuery) {
        this.andWhere('latest_comment.comment', 'like', `%${query.searchQuery}%`);
      }

      if (query.threadType && query.threadType.length > 0) {
        // Some comments will be included as part of 1+ threads,
        // in which case we can check the thread type
        // However, some will not be a part of any thread, in which case
        // we can figure out the thread type from the original thread type.
        this.where(function threadTypeQuery() {
          this.whereIn('threads.thread_type', query.threadType)
            .orWhere(function noThread() {
              this.whereNull('threads.thread_type')
                .whereIn('comments.original_thread_type', query.threadType);
            });
        });
      }

      if (query.type && query.type.length > 0) {
        this.whereIn('comments.type', query.type);
      }

      if (query.isHiddenInArchive !== undefined) {
        this.andWhere('comments.is_hidden', query.isHiddenInArchive);
      }
    })
      .whereNull('comments.deleted_at');

    if (page !== undefined && limit !== undefined) {
      qb.modify(withPagination, page, limit);
    }
  }

  withCountSelect(
    qb: Knex.QueryBuilder,
    // withThreadsFilters will be used with .modify
    // So 'this' inside this function will refer to the qb
    // passing the client as an argument to get around that
    commentsClient?: CommentsClient,
  ): void {
    qb.select({
      countSamples: commentsClient.knex.raw(
        'COUNT(DISTINCT threads.analysis_set_id)',
      ),
      countEntities: commentsClient.knex.raw(
        'COUNT(DISTINCT threads.id)',
      ),
    })
      .groupBy('comments.id');
  }

  private withXrefSelect(
    qb: Knex.QueryBuilder,
  ): void {
    qb.select({
      isHiddenInThread: 'xref.is_hidden',
      reportOrder: 'xref.report_order',
      reportLineBreak: 'xref.report_line_break',
      createdAt: 'xref.created_at',
      createdBy: 'xref.created_by',
    });
  }

  private withXrefFilters(
    qb: Knex.QueryBuilder,
    query: ICommentsQuery,
  ): void {
    qb.where(function filters() {
      if (query.isHiddenInThread !== undefined) {
        this.andWhere('xref.is_hidden', query.isHiddenInThread);
      }
    });
  }

  private commentsSortColumnMap(column: string): string {
    const map = {
      'Created At': 'xref.created_at',
      'Original Created At': 'comments.created_at',
    };
    return map[column];
  }

  private selectCommentVersionBase(trx: Knex.Transaction): Knex.QueryBuilder {
    const db = trx ?? this.knex;
    return db
      .select({
        id: 'commentVersion.id',
        commentId: 'commentVersion.comment_id',
        comment: 'commentVersion.comment',
        createdAt: 'commentVersion.created_at',
        createdBy: 'commentVersion.created_by',
      })
      .from({ commentVersion: this.commentsVersionTable });
  }

  public async getCommentVersions(
    commentId: string,
    trx?: Knex.Transaction,
  ): Promise<ICommentVersion[]> {
    return this.selectCommentVersionBase(trx)
      .where('commentVersion.comment_id', commentId)
      .orderBy('commentVersion.created_at', 'desc');
  }

  public async createCommentVersion(
    commentId: string,
    body: CreateCommentVersionBodyDTO,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;

    const id = uuid();
    await db.insert({
      id,
      comment_id: commentId,
      comment: body.comment,
      created_by: currentUser.id,
    })
      .into(this.commentsVersionTable);

    return id;
  }

  public async updateCommentVersion(
    versionId: string,
    body: IUpdateCommentVersionBody,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    await db.update({
      comment: body.comment,
    })
      .from(this.commentsVersionTable)
      .where('id', versionId);
  }

  public async keepLatestVersion(
    commentId: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    const lastId = await db.select({
      id: 'id',
    })
      .from(this.commentsVersionTable)
      .where('comment_id', commentId)
      .orderBy('created_at', 'desc')
      .first();

    await db.delete()
      .from(this.commentsVersionTable)
      .where('comment_id', commentId)
      .whereNot('id', lastId.id);
  }
}
