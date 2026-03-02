import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IEvidence, IUpdateEvidence } from 'Models/Evidence/Evidence.model';
import { IEvidenceQuery } from 'Models/Evidence/Requests/EvidenceQuery.model';
import { CreateEvidenceDTO } from 'Models/Evidence/Requests/PostEvidenceBody.model';
import { VariantType } from 'Models/Misc/VariantType.model';
import { IUser, IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EvidenceClient {
  private evidenceTable = 'zcc_evidences';

  private analysisSetTable = 'zcc_analysis_set';

  private readonly commentThreadsTable = 'zcc_curation_comment_thread';

  private readonly commentsTable = 'zcc_curation_comment';

  private readonly commentsThreadsXrefTable = 'zcc_curation_comment_thread_xref';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getEvidence(
    filters: IEvidenceQuery,
    user: IUserWithMetadata,
    // used when we know that what we are filtering for, they have access to
    skipAccessControl: boolean = false,
  ): Promise<IEvidence[]> {
    return this.selectEvidenceBase(user, skipAccessControl)
      .modify(this.withEvidenceFilters, filters, user, this, skipAccessControl)
      .orderBy('evidences.created_at', 'desc');
  }

  public async postEvidence(
    data: CreateEvidenceDTO,
    user: IUser,
  ): Promise<string> {
    const {
      entityId, entityType, externalId, analysisSetId, biosampleId,
    } = data;
    const id = uuidv4();
    await this.knex(this.evidenceTable).insert({
      evidence_id: id,
      external_id: externalId,
      analysis_set_id: analysisSetId,
      biosample_id: biosampleId,
      entity_id: entityId,
      entity_type: entityType,
      created_by: user.id,
      created_at: this.knex.fn.now(),
    });
    return id;
  }

  async updateEvidenceForEntity(
    body: IUpdateEvidence,
    user: IUser,
  ): Promise<void> {
    return this.knex.transaction(async (trx) => {
      await trx.delete()
        .from(this.evidenceTable)
        .where('entity_id', body.entityId)
        .andWhere('entity_type', body.entityType)
        .andWhere(function analysisSetIdFilter() {
          if (body.analysisSetId) {
            this.andWhere('analysis_set_id', body.analysisSetId);
          } else {
            this.whereNull('analysis_set_id');
          }

          if (body.biosampleId) {
            this.andWhere('biosample_id', body.biosampleId);
          } else {
            this.whereNull('biosample_id');
          }
        });

      if (body.externalIds.length) {
        await trx
          .insert(body.externalIds.map((e) => ({
            evidence_id: uuidv4(),
            external_id: e,
            analysis_set_id: body.analysisSetId,
            biosample_id: body.biosampleId,
            entity_id: body.entityId,
            entity_type: body.entityType,
            created_by: user.id,
            created_at: this.knex.fn.now(),
          })))
          .into(this.evidenceTable)
          .onConflict(['external_id', 'analysis_set_id', 'entity_id', 'entity_type'])
          .ignore();
      }
    });
  }

  public async swapEvidenceVariantId(
    analysisSetId: string,
    variantType: VariantType,
    oldVariantId: string | number,
    newVariantId: string | number,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;
    await db.update({
      entity_id: newVariantId,
    })
      .from(this.evidenceTable)
      .where('analysis_set_id', analysisSetId)
      .andWhere('entity_type', variantType)
      .andWhere('entity_id', oldVariantId);
  }

  public async deleteEvidenceById(evidenceId: string): Promise<number> {
    return this.knex(this.evidenceTable).where('evidence_id', evidenceId).del();
  }

  private selectEvidenceBase(
    user: IUserWithMetadata,
    skipAccessControl = false,
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

    const threads = this.knex
      .select('id')
      .from({ thread: this.commentThreadsTable })
      .where(function applyAc() {
        this.whereIn('thread.analysis_set_id', analysisSets)
          .orWhereIn('thread.biosample_id', biosamples);
      });

    const commentQuery = this.knex
      .select('comment.id')
      .from({ comment: this.commentsTable })
      .leftJoin({ xref: this.commentsThreadsXrefTable }, 'xref.comment_id', 'comment.id')
      .whereNull('comment.deleted_at')
      .andWhere(function applyAc() {
        this.whereIn('xref.thread_id', threads)
          .orWhereIn('comment.original_thread_id', threads);
      });

    return this.knex
      .select({
        evidenceId: 'evidences.evidence_id',
        externalId: 'evidences.external_id',
        analysisSetId: 'evidences.analysis_set_id',
        biosampleId: 'evidences.biosample_id',
        entityType: 'evidences.entity_type',
        entityId: 'evidences.entity_id',
        createdAt: 'evidences.created_at',
        createdBy: 'evidences.created_by',
        updatedAt: 'evidences.updated_at',
        updatedBy: 'evidences.updated_by',
      })
      .from({ evidences: this.evidenceTable })
      .where(function applyAccessControl() {
        if (!skipAccessControl) {
          this.whereIn('evidences.analysis_set_id', analysisSets)
            .orWhereIn('evidences.biosample_id', biosamples)
            .orWhere(function commentAccess() {
              this.where('evidences.entity_type', 'COMMENT')
                .whereIn('evidences.entity_id', commentQuery);
            });
        }
      });
  }

  private withEvidenceFilters(
    qb: Knex.QueryBuilder,
    filters: IEvidenceQuery,
    user: IUserWithMetadata,
    client: EvidenceClient,
    skipAccessControl = false,
  ): void {
    // get the samples that match the query
    const analysisSetQuery = client.knex.select('analysis_set_id')
      .where(function analysisSetFilters() {
        if (filters.searchQuery) {
          this.where('analysis_set_id', 'LIKE', `%${filters.searchQuery}%`)
            .orWhere('patient_id', 'LIKE', `%${filters.searchQuery}%`);
        }
        if (filters.evidenceIds?.length) {
          this.whereIn('evidences.evidence_id', filters.evidenceIds);
        }
        if (filters.analysisSetId) {
          this.andWhere('analysis_set_id', filters.analysisSetId);
        }
        if (filters.patientId) {
          this.andWhere('patient_id', filters.patientId);
        }
        if (filters.zero2Category?.length) {
          this.whereIn('zero2_category', filters.zero2Category);
        }
        if (filters.zero2Subcat1?.length) {
          this.whereIn('zero2_subcategory1', filters.zero2Subcat1);
        }
        if (filters.zero2Subcat2?.length) {
          this.whereIn('zero2_subcategory2', filters.zero2Subcat2);
        }
        if (filters.zero2FinalDiagnosis?.length) {
          this.whereIn('zero2_final_diagnosis', filters.zero2FinalDiagnosis);
        }
      });

    if (skipAccessControl) {
      analysisSetQuery
        .from(client.analysisSetTable);
    } else {
      analysisSetQuery
        .modify(withAnalysisSet, 'from', user);
    }

    // comments for matching the samples
    const commentQuery = client.knex.select('comment.id')
      .from({ comment: client.commentsTable })
      .innerJoin({ xref: client.commentsThreadsXrefTable }, 'xref.comment_id', 'comment.id')
      .innerJoin({ thread: client.commentThreadsTable }, 'thread.id', 'xref.thread_id')
      .whereIn('thread.analysis_set_id', analysisSetQuery)
      .whereNull('comment.deleted_at');

    qb
      .where(function customWhereBuilder() {
        if (filters.entityTypes?.length) {
          this.whereIn('evidences.entity_type', filters.entityTypes);
        }
      })
      .where(function customWhereBuilder() {
        if (filters.entityIds?.length) {
          this.whereIn('evidences.entity_id', filters.entityIds);
        }
      })
      .andWhere(function matchingSample() {
        if (
          filters.searchQuery
          || filters.analysisSetId
          || filters.patientId
          || filters.zero2Category?.length
          || filters.zero2Subcat1?.length
          || filters.zero2Subcat2?.length
          || filters.zero2FinalDiagnosis?.length
        ) {
          // either linked to a comment which is linked to a sample that matches the query
          this.andWhere(function matchingComments() {
            this.where('entity_type', 'COMMENT')
              .whereIn('entity_id', commentQuery);
          })
            // or linked to a sample directly (library resources)
            .orWhere(function matchesSampleId() {
              this.whereIn('evidences.analysis_set_id', analysisSetQuery);
            });
        }
      });
  }
}
