import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import {
  EvidenceEntityType,
  ICreateEvidence, IEvidence, IGetEvidence, IUpdateEvidence,
  IUser,
  IUserWithMetadata,
} from 'Models';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withClinicalVersion } from 'Utils/Query/accessControl/withClinicalVersions.util';
import { v4 as uuid } from 'uuid';

@Injectable()
export class EvidenceClient {
  private readonly evidenceTable = 'zcc_clinical_evidence';

  private readonly clinicalVersionTable = 'zcc_clinical_versions';

  private readonly commentThreadsTable = 'zcc_clinical_comment_thread';

  private readonly commentsTable = 'zcc_clinical_comment';

  private readonly commentsThreadsXrefTable = 'zcc_clinical_comment_thread_xref';

  private readonly interpretationsTable = 'zcc_clinical_interpretation_comment';

  private readonly recommendationsTable = 'zcc_clinical_recommendations';

  private readonly therapyTable = 'zcc_clinical_therapies';

  private readonly slideTable = 'zcc_clinical_slides';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getEvidence(
    query: IGetEvidence,
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
    skipAccessControl = false,
  ): Promise<IEvidence[]> {
    return this.getEvidenceBase(
      user,
      trx,
      skipAccessControl,
    )
      .modify(this.withFilters, query, this);
  }

  public async getEvidenceById(
    id: string,
    user: IUserWithMetadata,
    trx: Knex.Transaction,
  ): Promise<IEvidence> {
    return this.getEvidenceBase(user, trx)
      .where('id', id);
  }

  public async getEvidenceCount(
    query: IGetEvidence,
    user: IUserWithMetadata,
  ): Promise<number> {
    const data = await this.getEvidenceBase(user)
      .clearSelect()
      .count('* as count')
      .modify(this.withFilters, query, this)
      .first();

    return data ? data.count : 0;
  }

  public async createEvidence(
    body: ICreateEvidence,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<string> {
    const db = trx || this.knex;
    const id = uuid();
    await db.insert({
      id,
      external_id: body.externalId,
      // For comment, we only use the clinicalVersionId
      // To ensure the comment / verion combination is valid
      clinical_version_id: body.clinicalVersionId,
      entity_type: body.entityType,
      entity_id: body.entityId,
      created_by: currentUser.id,
      created_at: db.fn.now(),
    })
      .into(this.evidenceTable);

    return id;
  }

  async updateEvidenceForEntity(
    body: IUpdateEvidence,
    user: IUser,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx.delete()
      .from(this.evidenceTable)
      .where('entity_id', body.entityId)
      .andWhere('entity_type', body.entityType)
      .andWhere(function clinicalVersionId() {
        if (body.clinicalVersionId) {
          this.andWhere('clinical_version_id', body.clinicalVersionId);
        }
      });

    if (body.externalIds.length) {
      await trx
        .insert(body.externalIds.map((e) => ({
          id: uuid(),
          external_id: e,
          clinical_version_id: body.clinicalVersionId,
          entity_id: body.entityId,
          entity_type: body.entityType,
          created_by: user.id,
          created_at: this.knex.fn.now(),
        })))
        .into(this.evidenceTable)
        .onConflict()
        .ignore();
    }
  }

  public async deleteEvidence(id: string): Promise<void> {
    await this.knex.delete()
      .from(this.evidenceTable)
      .where('id', id);
  }

  private getEvidenceBase(
    user: IUserWithMetadata,
    trx?: Knex.Transaction,
    skipAccessControl = false,
  ): Knex.QueryBuilder {
    const db = trx ?? this.knex;

    const versions = db
      .select('version.id')
      .modify(
        withClinicalVersion,
        'from',
        user,
      );

    const threads = db
      .select('thread.id')
      .from({ thread: this.commentThreadsTable })
      .modify(withClinicalVersion, 'innerJoin', user, 'thread.clinical_version_id');

    const queries: Record<EvidenceEntityType, Knex.QueryBuilder> = {
      THERAPY: db
        .select('t.id')
        .from({ t: this.therapyTable })
        .innerJoin({ r: this.recommendationsTable }, 't.id', 'r.therapy_id')
        .modify(withClinicalVersion, 'innerJoin', user, 'r.clinical_version_id')
        .whereNull('r.deleted_at'),
      RECOMMENDATION: undefined,
      COMMENT: db
        .select('comment.id')
        .from({ comment: this.commentsTable })
        .leftJoin({ xref: this.commentsThreadsXrefTable }, 'xref.comment_id', 'comment.id')
        .whereNull('comment.deleted_at')
        .whereIn('xref.thread_id', threads),
      SLIDE: undefined,
    };

    const query = db.select({
      evidenceId: 'evidence.id',
      externalId: 'evidence.external_id',
      clinicalVersionId: 'evidence.clinical_version_id',
      entityType: 'evidence.entity_type',
      entityId: 'evidence.entity_id',
      createdBy: 'evidence.created_by',
      createdAt: 'evidence.created_at',
    })
      .from({ evidence: this.evidenceTable });

    if (skipAccessControl) {
      return query;
    }

    return query.where(function applyAccessControl() {
      this.orWhereIn('evidence.clinical_version_id', versions);
      for (const [key, q] of Object.entries(queries)) {
        if (q !== undefined) {
          this.orWhere(function subQuery() {
            this.where('entity_type', key)
              .whereIn('entity_id', q)
              .whereNull('evidence.clinical_version_id');
          });
        }
      }
    });
  }

  private withFilters(
    qb: Knex.QueryBuilder,
    query: IGetEvidence,
    client: EvidenceClient,
  ): void {
    // get the clinical versions that match the query
    const clinicalVersionQuery = client.knex.select('id')
      .from(client.clinicalVersionTable)
      .where(function clinicalVersionFilters() {
        if (query.searchQuery) {
          this.where('sample_id', 'LIKE', `%${query.searchQuery}%`)
            .orWhere('patient_id', 'LIKE', `%${query.searchQuery}%`);
        }
        if (query.clinicalVersionId) {
          this.andWhere('clinical_version_id', query.clinicalVersionId);
        }
        if (query.zero2Category?.length) {
          this.whereIn('zero2_category', query.zero2Category);
        }
        if (query.zero2Subcat1?.length) {
          this.whereIn('zero2_subcategory1', query.zero2Subcat1);
        }
        if (query.zero2Subcat2?.length) {
          this.whereIn('zero2_subcategory2', query.zero2Subcat2);
        }
        if (query.zero2FinalDiagnosis?.length) {
          this.whereIn('zero2_final_diagnosis', query.zero2FinalDiagnosis);
        }
      })
      .whereNot('status', 'Cancelled');

    // get the interpretation records from the clinical versions
    const interpretationQuery = client.knex.select('id')
      .from(client.interpretationsTable)
      .whereIn('clinical_version_id', clinicalVersionQuery)
      .whereNull('deleted_at');

    // comments for matching the interpretations
    const commentQuery = client.knex.select('comment.id')
      .from({ comment: client.commentsTable })
      .innerJoin({ xref: client.commentsThreadsXrefTable }, 'xref.comment_id', 'comment.id')
      .innerJoin({ thread: client.commentThreadsTable }, 'thread.id', 'xref.thread_id')
      .where('thread.entity_type', 'INTERPRETATION')
      .whereIn('thread.entity_id', interpretationQuery)
      .whereNull('comment.deleted_at');

    const recommendationQuery = client.knex.select('id')
      .from(client.recommendationsTable)
      .whereIn('clinical_version_id', clinicalVersionQuery)
      .whereNull('deleted_at');

    const slideQuery = client.knex.select('id')
      .from(client.slideTable)
      .whereIn('clinical_version_id', clinicalVersionQuery)
      .whereNull('deleted_at');

    qb.where(function filters() {
      if (query.externalId) {
        this.andWhere('external_id', query.externalId);
      }

      if (query.entityTypes?.length) {
        this.whereIn('entity_type', query.entityTypes);
      }

      if (query.entityIds?.length) {
        this.whereIn('entity_id', query.entityIds);
      }
    })
      .andWhere(function matchingClinicalVersion() {
        if (
          query.clinicalVersionId
          || query.searchQuery
          || query.zero2Category?.length
          || query.zero2Subcat1?.length
          || query.zero2Subcat2?.length
          || query.zero2FinalDiagnosis?.length
        ) {
          this.andWhere(function matchingComments() {
            this.where('entity_type', 'COMMENT')
              .whereIn('entity_id', commentQuery);
          })
            .orWhere(function matchingRecommendations() {
              this.where('entity_type', 'RECOMMENDATION')
                .whereIn('entity_id', recommendationQuery);
            })
            .orWhere(function matchingSlides() {
              this.where('entity_type', 'SLIDE')
                .whereIn('entity_id', slideQuery);
            });
        }
      });
  }

  public getTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  public async permanentlyDeleteByEntityTypeAndEntityIds(
    entityType: string,
    entityIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (entityIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.evidenceTable)
      .where('entity_type', entityType)
      .whereIn('entity_id', entityIds)
      .delete();
  }
}
