import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { commentTags } from 'Constants/Comment/Comment.constant';
import { Knex } from 'knex';
import {
  ICreateCommentBody,
  ICreateCommentThreadBody,
  ICreateCommentVersionBody,
  IUpdateCommentBody, IUpdateCommentVersionBody,
} from 'Models/Comment/CommentBody.model';
import { ICommentsQuery, ICommentThreadQuery, ICommentThreadsQuery } from 'Models/Comment/CommentQuery.model';
import { withClinicalVersion } from 'Utils/Query/accessControl/withClinicalVersions.util';
import { withPagination } from 'Utils/Query/Pagination.util';
import { v4 as uuid } from 'uuid';
import {
  IComment,
  ICommentThread,
  ICommentVersion,
  IRelatedThread,
  IUser,
  IUserWithMetadata,
  variantTypes,
} from '../../Models';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

Injectable();
export class CommentClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private readonly commentThreadsTable = 'zcc_clinical_comment_thread';

  private readonly commentsTable = 'zcc_clinical_comment';

  private readonly commentsVersionTable = 'zcc_clinical_comment_version';

  private readonly commentsThreadsXrefTable = 'zcc_clinical_comment_thread_xref';

  private readonly clinicalVersionTable = 'zcc_clinical_versions';

  private readonly molAlterationTable = 'zcc_clinical_mol_alterations';

  private readonly molAlterationGroupTable = 'zcc_clinical_mol_alterations_group';

  private readonly interpretationsTable = 'zcc_clinical_interpretation_comment';

  public async getCommentThreads(
    query: ICommentThreadsQuery,
    user: IUserWithMetadata,
  ): Promise<ICommentThread[]> {
    return this.selectCommentsThreadsBase(user)
      .modify(this.withThreadsFilters, query, this);
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
        analysisSetId: 'version.analysis_set_id',
        patientId: 'version.patient_id',
        entityType: 'threads.entity_type',
        zero2FinalDiagnosis: 'version.zero2_final_diagnosis',
        interpretationReportType: 'interpretations.report_type',
      })
      .from({ threads: this.commentThreadsTable })
      .modify(
        withClinicalVersion,
        'innerJoin',
        user,
        'threads.clinical_version_id',
      )
      .innerJoin(
        { xref: this.commentsThreadsXrefTable },
        'threads.id',
        'xref.thread_id',
      )
      .leftJoin(
        { interpretations: this.interpretationsTable },
        'interpretations.id',
        'threads.entity_id',
      )
      .where('xref.comment_id', commentId);
  }

  public getGeneThreadIds(genes: number[]): Knex.QueryBuilder {
    return this.knex.select('threads.id')
      .from({ threads: this.commentThreadsTable })
      .leftJoin({ interpretaion: this.interpretationsTable }, function interpretaionJoin() {
        this.on('threads.entity_id', 'interpretaion.id')
          .andOnIn('threads.entity_type', ['INTERPRETATION']);
      })
      .leftJoin(
        { group: this.molAlterationGroupTable },
        'interpretaion.mol_alteration_group_id',
        'group.group_id',
      )
      .leftJoin(
        { alteration: this.molAlterationTable },
        'group.mol_alteration_id',
        'alteration.id',
      )
      .whereIn('alteration.gene_id', genes)
      .orWhereIn('alteration.secondary_gene_id', genes);
  }

  public getGeneMutationThreadIds(geneMutations: string[]): Knex.QueryBuilder {
    return this.knex
      .select('clinical_version_id')
      .from(this.molAlterationTable)
      .where(function matchMutations() {
        for (const mutation of geneMutations) {
          const [type, gene] = mutation.split(':');
          this.orWhere(function matchMutation() {
            this
              .where('mutation_type', type)
              .andWhere(function matchGene() {
                this.where('gene', gene)
                  .orWhere('secondary_gene', gene);
              });
          });
        }
      });
  }

  public getClassifierThreadIds(classifiers: string[]): Knex.QueryBuilder {
    return this.knex
      .select('clinical_version_id')
      .from(this.molAlterationTable)
      .whereIn('mutation_id', classifiers)
      .andWhere('mutation_type', variantTypes.find((v) => v === 'METHYLATION_CLASSIFIER'));
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
      clinical_version_id: body.clinicalVersionId,
      entity_id: body.entityId,
      entity_type: body.entityType,
      created_by: currentUser.id,
    })
      .into(this.commentThreadsTable)
      .onConflict(['thread_type', 'clinical_version_id', 'entity_id', 'entity_type'])
      .ignore();

    const id = await db.select('id')
      .from({ threads: this.commentThreadsTable })
      .modify(
        this.withThreadsFilters,
        {
          ...body,
          threadType: [body.threadType],
          entityType: [body.entityType],
        },
        this,
      )
      .first();

    return id.id;
  }

  public async deleteCommentThread(
    id: string,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    await db.delete()
      .from(this.commentsThreadsXrefTable)
      .where('thread_id', id);

    await db.update({
      deleted_at: db.fn.now(),
      deleted_by: currentUser.id,
    })
      .where('id', id)
      .from(this.commentThreadsTable);
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
        // default sort newest to oldest
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
    user: IUserWithMetadata,
    {
      page = 1,
      limit = 100,
      sortColumns,
      sortDirections,
      ...query
    }: ICommentsQuery = {},
  ): Promise<IComment[]> {
    return this.selectCommentsBase(user)
      .select({
        countClinicalVersions: 'counts.countClinicalVersions',
        countEntities: 'counts.countEntities',
      })
      .where('xref.thread_id', threadId)
      .modify(this.withXrefSelect)
      .modify(this.withCommentFilters, query, page, limit, this)
      .modify(this.withXrefFilters, query)
      .innerJoin(
        this.selectCommentsBase(user)
          .modify(this.withCountSelect, this)
          .as('counts'),
        'counts.id',
        'comments.id',
      )
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

  public async getCommentById(
    id: string,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Promise<IComment> {
    const query = this.selectCommentsBase(user, trx)
      .modify(this.withCountSelect, this)
      .where('comments.id', id)
      .first();
    return query;
  }

  public async getCommentVersions(
    commentId: string,
    trx?: Knex.Transaction,
  ): Promise<ICommentVersion[]> {
    return this.selectCommentVersionBase(trx)
      .where('commentVersion.comment_id', commentId)
      .orderBy('commentVersion.created_at', 'desc');
  }

  public async createComment(
    body: ICreateCommentBody,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;

    // insert comment
    const commentId = uuid();
    await db.insert({
      id: commentId,
      type: body.type,
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

    let { threadId } = body;
    if (body.thread) {
      threadId = await this.createThread(body.thread, currentUser, trx);
    }

    if (threadId) {
      // insert link
      await db.insert({
        thread_id: threadId,
        comment_id: commentId,
        is_hidden: body.isHiddenInThread,
        is_resolved: body.isResolved,
        report_order: body.reportOrder,
        created_by: currentUser.id,
      })
        .into(this.commentsThreadsXrefTable);
    }

    return commentId;
  }

  public async createCommentVersion(
    commentId: string,
    body: ICreateCommentVersionBody,
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
      if (body.type || body.comment) {
        // get thread details
        const thread = await this.getCommentThreadById(query.threadId, currentUser);
        // get old comment details
        const oldComment = await this.getCommentById(id, currentUser);
        const oldVersions = await this.getCommentVersions(id);
        // remove comment from this thread
        await this.deleteComment(id, query, currentUser, trx);
        // create a new comment
        return this.createComment({
          isHiddenInArchive: oldComment?.isHiddenInArchive,
          reportOrder: oldComment?.reportOrder,
          // use the newest version's comment for the new comment
          comment: body.comment || oldVersions[0]?.comment,
          // updated fields
          type: body.type || oldComment?.type,
          isHiddenInThread: body.isHidden,
          isResolved: body.isResolved,
          thread: {
            threadType: thread.type,
            clinicalVersionId: thread.clinicalVersionId,
            entityId: thread.entityId,
            entityType: thread.entityType,
          },
        }, currentUser, trx);
      }

      // update the comment
      await db.update({
        is_hidden: body.isHidden,
        report_order: body.reportOrder,
        is_resolved: body.isResolved,
      })
        .from(this.commentsThreadsXrefTable)
        .where('comment_id', id)
        .where('thread_id', query.threadId);

      return id;
    }

    const oldVersions = await this.getCommentVersions(id);
    if (body.comment && oldVersions[0]) {
      await this.updateCommentVersion(
        oldVersions[0].id,
        {
          comment: body.comment,
        },
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

  public async keepLatestVersion(
    commentId: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    const lastId = await db.select({
      id: 'id',
    })
      .from(this.clinicalVersionTable)
      .where('comment_id', commentId)
      .orderBy('created_at', 'desc')
      .first();

    await db.delete()
      .from(this.clinicalVersionTable)
      .where('comment_id', commentId)
      .whereNot('id', lastId.id);
  }

  public async getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  public async getOldComments(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex(this.commentsTable)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  public async getOldCommentThreads(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex(this.commentThreadsTable)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  public async deleteCommentVersionsByCommentIds(
    commentIds: string[],
    trx?: Knex.Transaction,
  ): Promise<number> {
    if (commentIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.commentsVersionTable)
      .whereIn('comment_id', commentIds)
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

  private selectCommentsThreadsBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex.select({
      id: 'threads.id',
      type: 'threads.thread_type',
      clinicalVersionId: 'threads.clinical_version_id',
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
      .modify(
        withClinicalVersion,
        'innerJoin',
        user,
        'threads.clinical_version_id',
      );
  }

  private withThreadsFilters(
    qb: Knex.QueryBuilder,
    query: ICommentThreadsQuery,
    // withThreadsFilters will be used with .modify
    // So 'this' inside this function will refer to the qb
    // passing the client as an argument to get around that
    commentsClient: CommentClient,
  ): void {
    qb.where(function filters() {
      if (query.interpretationReportType && query.interpretationReportType.length > 0) {
        this.whereIn('interpretations.report_type', query.interpretationReportType);
      }

      if (query.threadType && query.threadType.length > 0) {
        this.whereIn('threads.thread_type', query.threadType);
      }

      if (query.entityId) {
        this.andWhere('threads.entity_id', query.entityId);
      }

      if (query.entityType && query.entityType.length > 0) {
        this.whereIn('threads.entity_type', query.entityType);
      }

      if (query.clinicalVersionId) {
        this.andWhere('threads.clinical_version_id', query.clinicalVersionId);
      }

      if (query.zero2Category && query.zero2Category.length > 0) {
        this.whereIn('version.zero2_category', query.zero2Category);
      }

      if (query.zero2Subcat1 && query.zero2Subcat1.length > 0) {
        this.whereIn('version.zero2_subcategory1', query.zero2Subcat1);
      }

      if (query.zero2Subcat2 && query.zero2Subcat2.length > 0) {
        this.whereIn('version.zero2_subcategory2', query.zero2Subcat2);
      }

      if (query.zero2FinalDiagnosis && query.zero2FinalDiagnosis.length > 0) {
        this.whereIn('version.zero2_final_diagnosis', query.zero2FinalDiagnosis);
      }

      if (commentsClient && query.geneIds && query.geneIds.length > 0) {
        this.whereIn('threads.id', commentsClient.getGeneThreadIds(query.geneIds));
      }

      if (commentsClient && query.geneMutations && query.geneMutations.length > 0) {
        this.whereIn('threads.id', commentsClient.getGeneMutationThreadIds(query.geneMutations));
      }

      if (commentsClient && query.classifier && query.classifier.length > 0) {
        this.whereIn('threads.id', commentsClient.getClassifierThreadIds(query.classifier));
      }
    })
      .whereNull('threads.deleted_at');
  }

  private selectCommentsBase(
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
  ): Knex.QueryBuilder {
    const db = trx ?? this.knex;
    return db.select({
      id: 'comments.id',
      type: 'comments.type',
      isHiddenInArchive: 'comments.is_hidden',
      originalCreatedAt: 'comments.created_at',
      originalCreatedBy: 'comments.created_by',
      updatedAt: 'comments.updated_at',
      updatedBy: 'comments.updated_by',
      deletedAt: 'comments.deleted_at',
      deletedBy: 'comments.deleted_by',
    })
      .from({ comments: this.commentsTable })
      .innerJoin(
        { xref: this.commentsThreadsXrefTable },
        'comments.id',
        'xref.comment_id',
      )
      .innerJoin(
        { threads: this.commentThreadsTable },
        'threads.id',
        'xref.thread_id',
      )
      .modify(
        withClinicalVersion,
        'innerJoin',
        user,
        'threads.clinical_version_id',
      )
      .leftJoin(
        { interpretations: this.interpretationsTable },
        'interpretations.id',
        'threads.entity_id',
      );
  }

  private withCommentFilters(
    qb: Knex.QueryBuilder,
    query: ICommentsQuery,
    page?: number,
    limit?: number,
    commentClient?: CommentClient,
  ): void {
    const latestVersionsSubquery = commentClient.knex
      .select('cv.comment_id', 'cv.comment')
      .from({ cv: commentClient.commentsVersionTable })
      .join(
        commentClient.knex
          .select('comment_id')
          .max('created_at as max_created_at')
          .from({ cv2: commentClient.commentsVersionTable })
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
        // we can figure out the thread type from the comment type.
        // This function will lead to SQL like this
        // where
        //      threads.thread_type = 'REPORTS'
        //      or (
        //        threads.thread_type is null
        //        and comments.type in ('GENE', 'PROGNOSTIC', ...)
        //      )
        this.where(function threadTypeQuery() {
          this.whereIn('threads.thread_type', query.threadType)
            .orWhere(function noThread() {
              this.whereNull('threads.thread_type')
                .whereIn('comments.type', [
                  ...query.threadType,
                  ...(
                    query.threadType.includes('REPORTS')
                      ? commentTags
                      : []
                  ),
                ]);
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

  private selectCommentVersionBase(trx: Knex.Transaction): Knex.QueryBuilder {
    const db = trx ?? this.knex;
    return db.select({
      id: 'commentVersion.id',
      commentId: 'commentVersion.comment_id',
      comment: 'commentVersion.comment',
      createdAt: 'commentVersion.created_at',
      createdBy: 'commentVersion.created_by',
    })
      .from({ commentVersion: this.commentsVersionTable });
  }

  withCountSelect(
    qb: Knex.QueryBuilder,
    // withThreadsFilters will be used with .modify
    // So 'this' inside this function will refer to the qb
    // passing the client as an argument to get around that
    commentsClient?: CommentClient,
    trx?: Knex.Transaction,
  ): void {
    const db = trx ?? commentsClient.knex;
    qb.select({
      countClinicalVersions: db.raw(
        'COUNT(DISTINCT threads.clinical_version_id)',
      ),
      countEntities: db.raw(
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
      isResolved: 'xref.is_resolved',
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

      if (query.isResolved !== undefined) {
        this.andWhere('xref.is_resolved', query.isResolved);
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
}
