import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CreateRecommendationDTO,
  CreateRecommendationLinkDTO,
  FetchRecommendationDTO,
  GermlineRecOption,
  IDiagnosisRecommendation,
  IFetchRecommendation,
  IGroupRecommendation,
  IRecommendationLinks,
  RecLinkEntityType,
  UpdateRecommendationDTO,
  UpdateRecommendationOrderDTO,
} from 'Models/Recommendation/Recommendation.model';
import { withPagination } from 'Utils/Query/Pagination.util';
import { addendumRecsSort, recommendationsSort } from 'Utils/Transformers/sortMapping.util';
import { v4 as uuidV4 } from 'uuid';
import { IUser } from '../../Models';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

@Injectable()
export class RecommendationClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) { }

  private recommendationTable = 'zcc_clinical_recommendations';

  private recommendationsEntityXrefTable = 'zcc_clinical_recommendations_entity_xref';

  private diagnosisRecTable = 'zcc_clinical_diagnosis_recommendations';

  private germlineRecTable = 'zcc_clinical_germline_recommendations';

  private htsPastRecTable = 'zcc_clinical_hts_past_recommendations';

  private discussionRecXrefTable = 'zcc_clinical_discussion_recommendation_xref';

  private therapyDrugsTable = 'zcc_clinical_therapy_drugs';

  public async createRecommendationLink(
    clinicalVersionId: string,
    body: CreateRecommendationLinkDTO,
    trx?: Knex.Transaction,
  ): Promise<void> {
    if (trx && trx.isCompleted()) {
      throw new InternalServerErrorException('Transaction failed');
    }

    const db = trx || this.knex;

    const mergedCols: string[] = [];

    if (body.order !== undefined) mergedCols.push('order');
    if (body.hidden !== undefined) mergedCols.push('is_hidden');

    const query = db
      .insert({
        recommendation_id: body.recommendationId,
        clinical_version_id: clinicalVersionId,
        entity_type: body.entityType,
        entity_id: body.entityId,
        order: body.order,
        is_hidden: body.hidden,
      })
      .into(this.recommendationsEntityXrefTable)
      .onConflict([
        'recommendation_id',
        'clinical_version_id',
        'entity_type',
        'entity_id',
      ]);
    if (mergedCols.length) {
      await query.merge(mergedCols);
    } else {
      await query.ignore();
    }
  }

  public async deleteRecommendationLink(
    recommendationId: string,
    clinicalVersionId: string,
    entityType?: RecLinkEntityType,
    entityId?: string,
    trx?: Knex.Transaction,
  ): Promise<void> {
    if (trx && trx.isCompleted()) {
      throw new InternalServerErrorException('Transaction failed');
    }

    const db = trx || this.knex;

    await db
      .delete()
      .from(this.recommendationsEntityXrefTable)
      .where({
        recommendation_id: recommendationId,
        clinical_version_id: clinicalVersionId,
        entity_type: entityType,
        entity_id: entityId,
      });
  }

  public async getRecommendationLinks(
    recommendationId: string,
  ): Promise<IRecommendationLinks[]> {
    return this.knex
      .select({
        recommendationId: 'recommendation_id',
        clinicalVersionId: 'clinical_version_id',
        entityType: 'entity_type',
        entityId: 'entity_id',
        order: 'order',
        hidden: 'is_hidden',
      })
      .from(this.recommendationsEntityXrefTable)
      .where('recommendation_id', recommendationId);
  }

  public async createRecommendation(
    clinicalVersionId: string,
    {
      molAlterationGroupId,
      type,
      title,
      description,
      tier,
      showIndividualTiers,
    }: CreateRecommendationDTO,
    therapyId: string,
    diagnosisId: string,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<string> {
    if (trx.isCompleted()) {
      throw new InternalServerErrorException('Transaction failed');
    }

    const id = uuidV4();
    await trx
      .insert({
        id,
        mol_alteration_group_id: molAlterationGroupId,
        type,
        title,
        description,
        tier,
        show_individual_tiers: showIndividualTiers,
        clinical_version_id: clinicalVersionId,
        therapy_id: therapyId || null,
        clinical_diagnosis_recommendation_id: diagnosisId || null,
        created_by: currentUser?.id,
        created_at: this.knex.fn.now(),
      })
      .into(this.recommendationTable);

    return id;
  }

  public async createGermlineRecOptions(
    recId: string,
    options: GermlineRecOption[],
    trx: Knex.Transaction,
  ): Promise<void> {
    await Promise.all(options.map((option, i) => (
      trx
        .insert({
          id: recId,
          option,
          order: i + 1,
        })
        .into(this.germlineRecTable))));
  }

  public async createDiagnosisRecommendation(
    {
      description,
      zero2Category,
      zero2Subcat1,
      zero2Subcat2,
      zero2FinalDiagnosis,
    }: Omit<IDiagnosisRecommendation, 'id' | 'clinicalVersionId' | 'molAlterationGroupId' | 'type'>,
    currentUser: IUser,
    trx: Knex.Transaction,
  ): Promise<string | null> {
    const id = uuidV4();

    try {
      await trx
        .insert({
          id,
          description,
          recommended_cancer_category: zero2Category,
          recommended_cancer_type: zero2Subcat1,
          recommended_diagnosis: zero2Subcat2,
          recommended_final_diagnosis: zero2FinalDiagnosis,
          recommended_zero2_category: zero2Category,
          recommended_zero2_subcategory1: zero2Subcat1,
          recommended_zero2_subcategory2: zero2Subcat2,
          recommended_zero2_final_diagnosis: zero2FinalDiagnosis,
          created_by: currentUser?.id,
          created_at: this.knex.fn.now(),
        })
        .into(this.diagnosisRecTable);

      return id;
    } catch {
      return null;
    }
  }

  public async createGroupRecommendation(
    parentRecId: string,
    childRecs: Pick<IGroupRecommendation, 'id' | 'order'>[],
    trx: Knex.Transaction,
  ): Promise<void> {
    try {
      await trx
        .insert(childRecs.map((r) => ({
          parent_recommendation_id: parentRecId,
          child_recommendation_id: r.id,
          order: r.order,
        })))
        .into(this.discussionRecXrefTable);
    } catch {
      trx.rollback();
    }
  }

  private getRecommendationBase(
    clinicalVersionId: string,
  ): Knex.QueryBuilder {
    return this.knex
      .distinct({
        id: 'r.id',
        molAlterationGroupId: 'r.mol_alteration_group_id',
        type: 'r.type',
        title: 'r.title',
        description: 'r.description',
        tier: 'r.tier',
        showIndividualTiers: 'r.show_individual_tiers',
        clinicalVersionId: 'r.clinical_version_id',
        zero2Category: 'd.recommended_zero2_category',
        zero2Subcat1: 'd.recommended_zero2_subcategory1',
        zero2Subcat2: 'd.recommended_zero2_subcategory2',
        zero2FinalDiagnosis: 'd.recommended_zero2_final_diagnosis',
        therapyId: 'r.therapy_id',
        clinicalDiagnosisRecommendationId: 'd.id',
        createdAt: 'r.created_at',
      })
      .from<IFetchRecommendation>({ r: this.recommendationTable })
      .leftJoin(
        { d: this.diagnosisRecTable },
        'd.id',
        'r.clinical_diagnosis_recommendation_id',
      )
      .leftJoin(
        { entity: this.recommendationsEntityXrefTable },
        'entity.recommendation_id',
        'r.id',
      )
      .where('r.clinical_version_id', clinicalVersionId)
      .whereNull('r.deleted_at');
  }

  public async getRecommendationById(
    clinicalVersionId: string,
    recommendationId: string,
  ): Promise<IFetchRecommendation> {
    return this.getRecommendationBase(clinicalVersionId)
      .where('r.id', recommendationId)
      .first();
  }

  public async getRecommendationsByAddendumId(
    clinicalVersionId: string,
    addendumId: string,
  ): Promise<IFetchRecommendation[]> {
    const orderByString = `
      ${recommendationsSort('r.type', 'r.tier')} desc,
      r.created_at desc`;
    return this.getRecommendationBase(clinicalVersionId)
      .leftJoin({ h: this.htsPastRecTable }, 'h.recommendation_id', 'r.id')
      .where('h.hts_addendum_id', addendumId)
      .orderByRaw(orderByString);
  }

  public async getAllRecommendations(
    clinicalVersionId: string,
    {
      slideId,
      molAlterationGroupId,
      htsAddendumId,
      types,
      reportType,
      entityType,
      entityId,
    }: FetchRecommendationDTO,
    page: number,
    limit: number,
  ): Promise<IFetchRecommendation[]> {
    const addendumRecs = htsAddendumId
      ? await this.getRecommendationsByAddendumId(clinicalVersionId, htsAddendumId)
      : [];

    const orderByString = `
      ${addendumRecsSort('r.id', addendumRecs.map((r) => `'${r.id}'`).join(','))} desc,
      ${recommendationsSort('r.type', 'r.tier')} desc,
      r.created_at desc`;

    return this.getRecommendationBase(clinicalVersionId)
      .andWhere(function customWhereBuilder() {
        if (clinicalVersionId) {
          this.andWhere('r.clinical_version_id', clinicalVersionId);
        }
        if (slideId) {
          this.where('entity.entity_type', 'SLIDE')
            .where('entity.entity_id', slideId);
        }
        if (molAlterationGroupId) {
          this.orWhere('r.mol_alteration_group_id', molAlterationGroupId);
        }
        if (types) {
          this.whereIn('r.type', types);
        }
        if (reportType && reportType.length) {
          this.where('entity.entity_type', 'REPORT')
            .whereIn('entity.entity_id', reportType);
        }
        // empty list means we want recs that are not only in the report
        if (reportType && reportType.length === 0) {
          this.whereNot('entity.entity_type', 'REPORT');
        }
        if (entityType) {
          this.where('entity.entity_type', entityType);
        }
        if (entityId) {
          this.where('entity.entity_id', entityId);
        }
      })
      .orderByRaw(orderByString)
      .modify(withPagination, page, limit);
  }

  public async getChildRecommendations(
    clinicalVersionId: string,
    parentRecId: string,
  ): Promise<IFetchRecommendation[]> {
    return this.getRecommendationBase(
      clinicalVersionId,
    )
      .distinct('disc.order')
      .leftJoin(
        { disc: this.discussionRecXrefTable },
        'disc.child_recommendation_id',
        'r.id',
      )
      .where('disc.parent_recommendation_id', parentRecId)
      .orderBy('disc.order', 'asc');
  }

  public async getGermlineRecOptions(
    recId: string,
  ): Promise<GermlineRecOption[]> {
    return this.knex
      .select('option', 'order')
      .from(this.germlineRecTable)
      .where('id', recId)
      .orderBy('order', 'asc')
      .pluck('option');
  }

  public async updateRecommendationOrder(
    clinicalVersionId: string,
    body: UpdateRecommendationOrderDTO,
  ): Promise<void> {
    await Promise.all(body.order.map((o) => (
      this.knex
        .update({
          order: o.order,
        })
        .from(this.recommendationsEntityXrefTable)
        .where('recommendation_id', o.id)
        .where('clinical_version_id', clinicalVersionId)
        .where('entity_type', body.entityType)
        .where('entity_id', body.entityId)
    )));
  }

  public async updateRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    {
      tier,
      title,
      description,
      germlineRecOptions,
      zero2Category,
      zero2Subcat1,
      zero2Subcat2,
      zero2FinalDiagnosis,
    }: UpdateRecommendationDTO,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<number> {
    const db = trx || this.knex;
    const recommendation = await this.getRecommendationById(clinicalVersionId, recommendationId);
    if (recommendation.type === 'CHANGE_DIAGNOSIS') {
      await db(this.diagnosisRecTable)
        .update({
          recommended_zero2_category: zero2Category,
          recommended_zero2_subcategory1: zero2Subcat1,
          recommended_zero2_subcategory2: zero2Subcat2,
          recommended_zero2_final_diagnosis: zero2FinalDiagnosis,
          updated_by: currentUser?.id,
          updated_at: this.knex.fn.now(),
        })
        .where('id', recommendation.clinicalDiagnosisRecommendationId);
    } else if (recommendation.type === 'GERMLINE' && germlineRecOptions) {
      await db
        .from(this.germlineRecTable)
        .where('id', recommendationId)
        .del();
      await db
        .insert(germlineRecOptions.map((option, i) => ({
          id: recommendationId,
          option,
          order: i + 1,
        })))
        .into(this.germlineRecTable);
    }

    return db
      .update({
        tier,
        title,
        description,
        updated_by: currentUser?.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.recommendationTable)
      .where('id', recommendationId);
  }

  public async deleteRecommendation(
    clinicalVersionId: string,
    recommendationId: string,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx || this.knex;

    const recommendation = await this.getRecommendationById(clinicalVersionId, recommendationId);
    if (recommendation.type === 'CHANGE_DIAGNOSIS') {
      await db
        .update({
          deleted_by: currentUser?.id,
          deleted_at: this.knex.fn.now(),
        })
        .from(this.diagnosisRecTable)
        .where('id', recommendation.clinicalDiagnosisRecommendationId);
    }

    await db
      .update({
        deleted_by: currentUser?.id,
        deleted_at: this.knex.fn.now(),
      })
      .from(this.recommendationTable)
      .where('id', recommendationId);
  }

  public async getRecommendationIdsWithDrugVersion(
    clinicalVersionId: string,
    drugVersionId: string,
  ): Promise<string[]> {
    return this.getRecommendationBase(clinicalVersionId)
      .innerJoin({ td: this.therapyDrugsTable }, 'r.therapy_id', 'td.therapy_id')
      .where('r.clinical_version_id', clinicalVersionId)
      .andWhere('td.external_drug_version_id', drugVersionId)
      .pluck('r.id')
      .distinct();
  }

  public async openKnexTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  public async closeKnexTransaction(
    trx: Knex.Transaction,
  ): Promise<void> {
    if (!trx.isCompleted()) {
      await trx.commit();
    }
  }

  getCleanupTables(): Record<string, string> {
    return {
      recommendationTable: this.recommendationTable,
      diagnosisRecTable: this.diagnosisRecTable,
    };
  }

  async getMolAlterationGroupIdsFromRecommendations(
    recommendationIds: string[],
  ): Promise<string[]> {
    if (recommendationIds.length === 0) {
      return [];
    }
    return this.knex(this.recommendationTable)
      .select('mol_alteration_group_id')
      .whereIn('id', recommendationIds)
      .whereNotNull('mol_alteration_group_id')
      .pluck('mol_alteration_group_id')
      .then((ids) => Array.from(new Set(ids)));
  }

  async getMolAlterationGroupIdsStillInUse(
    groupIds: string[],
    excludeRecommendationIds: string[],
  ): Promise<string[]> {
    if (groupIds.length === 0) {
      return [];
    }
    const db = this.knex;

    return db(this.recommendationTable)
      .select('mol_alteration_group_id')
      .whereIn('mol_alteration_group_id', groupIds)
      .whereNotIn('id', excludeRecommendationIds)
      .whereNull('deleted_at')
      .pluck('mol_alteration_group_id');
  }

  async getTherapyIdsFromRecommendations(recommendationIds: string[]): Promise<string[]> {
    if (recommendationIds.length === 0) {
      return [];
    }
    return this.knex(this.recommendationTable)
      .select('therapy_id')
      .whereIn('id', recommendationIds)
      .whereNotNull('therapy_id')
      .pluck('therapy_id')
      .then((ids) => Array.from(new Set(ids)));
  }

  /**
   * Returns therapy IDs still referenced by other (non-excluded) recommendations.
   */
  async getTherapyIdsStillInUseByRecommendations(
    therapyIds: string[],
    excludeRecommendationIds: string[],
  ): Promise<string[]> {
    if (therapyIds.length === 0) {
      return [];
    }
    return this.knex(this.recommendationTable)
      .select('therapy_id')
      .whereIn('therapy_id', therapyIds)
      .whereNotIn('id', excludeRecommendationIds)
      .whereNull('deleted_at')
      .pluck('therapy_id')
      .then((ids) => Array.from(new Set(ids)));
  }

  async getOldRecordIds(
    cutoffDate: Date,
    compareColumn: string,
    table: string,
  ): Promise<string[]> {
    return this.knex(table)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  async permanentlyDeleteRecommendationsByRcmIds(
    recommendationIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (recommendationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db(this.recommendationTable)
      .whereIn('id', recommendationIds)
      .delete();
  }

  async permanentlyDeleteRecommendationsByDiagRcmIds(
    diagnosisRecommendationIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (diagnosisRecommendationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db(this.recommendationTable)
      .whereIn('clinical_diagnosis_recommendation_id', diagnosisRecommendationIds)
      .delete();
  }

  async permanentlyDeleteDiagnosisRecommendationById(
    diagnosisRecommendationIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (diagnosisRecommendationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;

    return db(this.diagnosisRecTable)
      .whereIn('id', diagnosisRecommendationIds)
      .delete();
  }
}
