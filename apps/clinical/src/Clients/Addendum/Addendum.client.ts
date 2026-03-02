import {
    Inject,
    Injectable,
} from '@nestjs/common';
import { Knex } from 'knex';
import { IUser } from 'Models';
import {
    IAddendum,
    ICreateAddendumBodyDTO,
    IHTSDrugBase,
    IHTSDrugHit,
    IUpdateAddendumBodyDTO,
    IUpdateHTSDrugBodyDTO,
    IUpdateHTSDrugHitBodyDTO,
    IUpdatePastRecommendationBodyDTO,
} from 'Models/Addendum/Addendum.model';
import { v4 as uuidv4 } from 'uuid';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

Injectable();
export class AddendumClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private addendumTable = 'zcc_clinical_addendum';

  private htsDrugsTable = 'zcc_clinical_hts_drugs';

  private htsDrugHitsTable = 'zcc_clinical_hts_drug_hits';

  private htsPastRecommendationsTable = 'zcc_clinical_hts_past_recommendations';

  public async getHTSDrugHits(
    addendumId: string,
  ): Promise<IHTSDrugHit[]> {
    return this.knex
      .select({
        addendumId: 'a.hts_addendum_id',
        drugId: 'a.hts_drug_id',
        description: 'a.description',
        tier: 'a.tier',
      })
      .from({ a: this.htsDrugHitsTable })
      .where('a.hts_addendum_id', addendumId);
  }

  public async getHTSDrugs(
    sampleId: string,
    htsId: string,
    drugIds?: string[],
  ): Promise<IHTSDrugBase[]> {
    return this.knex
      .select({
        id: 'a.id',
        sampleId: 'a.sample_id',
        htsId: 'a.hts_id',
        drugId: 'a.drug_id',
        drugName: 'a.drug_name',
        targets: 'a.targets',
        reportable: 'a.reportable',
        reportedAs: 'a.reported_as',
        fileId: 'a.file_id',
      })
      .from({ a: this.htsDrugsTable })
      .where('a.sample_id', sampleId)
      .andWhere('a.hts_id', htsId)
      .andWhere(function customDrugFilter() {
        if (drugIds && drugIds.length > 0) {
          this.whereIn('a.drug_id', drugIds);
        }
      });
  }

  public async getAddendumsByVersionId(
    clinicalVersionId: string,
  ): Promise<IAddendum[]> {
    return this.knex
      .select({
        id: 'a.id',
        clinicalHistory: 'a.clinical_history',
        title: 'a.title',
        note: 'a.note',
        discussionTitle: 'a.discussion_title',
        discussionNote: 'a.discussion_note',
        clinicalVersionId: 'a.clinical_version_id',
        addendumType: 'a.addendum_type',
      })
      .from({ a: this.addendumTable })
      .where('a.clinical_version_id', clinicalVersionId)
      .orderByRaw('updated_at desc, created_at desc');
  }

  public async createAddendum(
    createAddendumBody: ICreateAddendumBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    const id = uuidv4();

    return this.knex
      .insert({
        id,
        title: createAddendumBody.title,
        note: createAddendumBody.note,
        clinical_history: createAddendumBody.clinicalHistory,
        clinical_version_id: createAddendumBody.clinicalVersionId,
        addendum_type: createAddendumBody.addendumType,
        created_by: currentUser.id,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser.id,
      })
      .into(this.addendumTable);
  }

  public async updatePastRecommendation(
    addendumId: string,
    updatePastRecBody: IUpdatePastRecommendationBodyDTO,
  ): Promise<number> {
    if (updatePastRecBody.mode === 'remove') {
      return this.knex
        .from({ a: this.htsPastRecommendationsTable })
        .where('a.hts_addendum_id', addendumId)
        .andWhere('a.recommendation_id', updatePastRecBody.recommendationId)
        .delete();
    }

    return this.knex
      .insert({
        hts_addendum_id: addendumId,
        recommendation_id: updatePastRecBody.recommendationId,
      })
      .into(this.htsPastRecommendationsTable);
  }

  public async updateHTSDrugHit(
    addendumId: string,
    drugId: string,
    updateHTSDrugHitBody: IUpdateHTSDrugHitBodyDTO,
  ): Promise<number> {
    if (updateHTSDrugHitBody.removeHit) {
      return this.knex
        .from({ a: this.htsDrugHitsTable })
        .where('a.hts_addendum_id', addendumId)
        .andWhere('a.hts_drug_id', drugId)
        .delete();
    }

    return this.knex
      .update({
        description: updateHTSDrugHitBody.description,
        tier: updateHTSDrugHitBody.tier,
      })
      .from({ a: this.htsDrugHitsTable })
      .where('a.hts_addendum_id', addendumId)
      .andWhere('a.hts_drug_id', drugId);
  }

  public async updateHTSDrug(
    sampleId: string,
    htsId: string,
    drugId: string,
    updateHTSDrugBody: IUpdateHTSDrugBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        reported_as: updateHTSDrugBody.reportedAs,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser.id,
      })
      .from({ a: this.htsDrugsTable })
      .where('a.sample_id', sampleId)
      .andWhere('a.hts_id', htsId)
      .andWhere('a.drug_id', drugId);
  }

  public async updateAddendum(
    addendumId: string,
    updateAddendumBody: IUpdateAddendumBodyDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        clinical_history: updateAddendumBody.clinicalHistory,
        title: updateAddendumBody.title,
        note: updateAddendumBody.note,
        discussion_title: updateAddendumBody.discussionTitle,
        discussion_note: updateAddendumBody.discussionNote,
        updated_at: this.knex.fn.now(),
        updated_by: currentUser.id,
      })
      .from({ a: this.addendumTable })
      .where('a.id', addendumId);
  }
}
