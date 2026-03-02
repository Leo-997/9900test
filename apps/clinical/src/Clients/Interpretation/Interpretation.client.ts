import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IUser } from 'Models';
import {
  ICreateInterpretationBody,
  IInterpretation,
  IInterpretationQuery,
  IUpdateInterpretationBody,
  UpdateInterpretationOrderDTO,
} from 'Models/Interpretation/Interpretation.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InterpretationsClient {
  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) { }

  private readonly interpretationsTable = 'zcc_clinical_interpretation_comment';

  private readonly molAlterationsGroupTable = 'zcc_clinical_mol_alterations_group';

  public async createInterpretation(
    clinicalVersionId: string,
    body: ICreateInterpretationBody,
    user: IUser,
  ): Promise<string> {
    const id = uuid();
    await this.knex.insert({
      id,
      title: body.title,
      clinical_version_id: clinicalVersionId,
      mol_alteration_group_id: body.molAlterationGroupId,
      order: body.order,
      report_type: body.reportType,
      created_by: user.id,
    })
      .into(this.interpretationsTable);
    return id;
  }

  public async getInterpretations(
    clinicalVersionId: string,
    query: IInterpretationQuery,
  ): Promise<IInterpretation[]> {
    return this.selectInterpretationBase(clinicalVersionId)
      .modify(this.withInterpretationsFilters, query);
  }

  public async getInterpretationById(
    clinicalVersionId: string,
    id: string,
  ): Promise<IInterpretation> {
    return this.selectInterpretationBase(clinicalVersionId)
      .where('id', id)
      .first();
  }

  async updateInterpretationOrder(
    clinicalVersionId: string,
    body: UpdateInterpretationOrderDTO,
    user: IUser,
  ): Promise<void> {
    await Promise.all(body.order.map(
      (o) => this.knex.update({
        order: o.order,
        updated_by: user.id,
        updated_at: this.knex.fn.now(),
      })
        .from(this.interpretationsTable)
        .where('id', o.id)
        .andWhere('clinical_version_id', clinicalVersionId),
    ));
  }

  public async updateInterpretation(
    clinicalVersionId: string,
    id: string,
    body: IUpdateInterpretationBody,
    user: IUser,
  ): Promise<void> {
    await this.knex.update({
      title: body.title,
      mol_alteration_group_id: body.molAlterationGroupId,
      updated_by: user.id,
      updated_at: this.knex.fn.now(),
    })
      .from(this.interpretationsTable)
      .where('id', id)
      .andWhere('clinical_version_id', clinicalVersionId);
  }

  public async deleteInterpretation(
    clinicalVersionId: string,
    id: string,
    user: IUser,
  ): Promise<void> {
    await this.knex.update({
      deleted_by: user.id,
      deleted_at: this.knex.fn.now(),
    })
      .from(this.interpretationsTable)
      .where('id', id)
      .andWhere('clinical_version_id', clinicalVersionId);
  }

  private selectInterpretationBase(
    clinicalVersionId: string,
  ): Knex.QueryBuilder {
    return this.knex.select({
      id: 'id',
      title: 'title',
      clinicalVersionId: 'clinical_version_id',
      molAlterationGroupId: 'mol_alteration_group_id',
      order: 'order',
      reportType: 'report_type',
      createdBy: 'created_by',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      updatedBy: 'updated_by',
      deletedAt: 'deleted_at',
      deletedBy: 'deleted_by',
    })
      .from(this.interpretationsTable)
      .where('clinical_version_id', clinicalVersionId)
      .whereNull('deleted_at');
  }

  private withInterpretationsFilters(
    qb: Knex.QueryBuilder,
    filters: IInterpretationQuery,
  ): void {
    qb.where(function filter() {
      if (filters.molAlterationGroupId) {
        this.where('mol_alteration_group_id', filters.molAlterationGroupId);
      }

      if (filters.reportType) {
        this.where('report_type', filters.reportType);
      }
    });
  }

  public async openKnexTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  async getOldInterpretationIds(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex(this.interpretationsTable)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  async permanentlyDeleteInterpretationByIds(
    interpretationIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (interpretationIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.interpretationsTable)
      .whereIn('id', interpretationIds)
      .delete();
  }

  async getMolAlterationGroupIdsFromInterpretations(
    interpretationIds: string[],
  ): Promise<string[]> {
    if (interpretationIds.length === 0) {
      return [];
    }
    return this.knex(this.interpretationsTable)
      .select('mol_alteration_group_id')
      .whereIn('id', interpretationIds)
      .whereNotNull('mol_alteration_group_id')
      .pluck('mol_alteration_group_id')
      .then((ids) => Array.from(new Set(ids))); // Remove duplicates
  }

  async getMolAlterationGroupIdsStillInUse(
    groupIds: string[],
    excludeInterpretationIds: string[],
  ): Promise<string[]> {
    if (groupIds.length === 0) {
      return [];
    }
    const db = this.knex;

    // Check if group IDs are still referenced by other interpretations
    return db(this.interpretationsTable)
      .select('mol_alteration_group_id')
      .whereIn('mol_alteration_group_id', groupIds)
      .whereNotIn('id', excludeInterpretationIds)
      .whereNull('deleted_at')
      .pluck('mol_alteration_group_id');
  }

  async permanentlyDeleteMolAlterationsGroupByIds(
    groupIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (groupIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.molAlterationsGroupTable)
      .whereIn('group_id', groupIds)
      .delete();
  }
}
