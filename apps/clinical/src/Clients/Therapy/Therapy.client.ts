import {
  Inject, Injectable, InternalServerErrorException,
} from '@nestjs/common';
import { Knex } from 'knex';
import { withClinicalVersion } from 'Utils/Query/accessControl/withClinicalVersions.util';
import { v4 as uuidV4 } from 'uuid';
import { IUser, IUserWithMetadata } from '../../Models';
import {
  ICreateTherapy,
  IMatchingTherapiesQuery,
  ITherapy,
  ITherapyBase,
  UpdateTherapyDTO,
} from '../../Models/Therapy/Therapy.model';
import { KNEX_CONNECTION } from '../../Modules/Knex/constants';

@Injectable()
export class TherapyClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) { }

  private therapyTable = 'zcc_clinical_therapies';

  private therapyDrugTable = 'zcc_clinical_therapy_drugs';

  private recommendationsTable = 'zcc_clinical_recommendations';

  private therapyEvidenceTable = 'zcc_clinical_therapy_evidence';

  public async createTherapy(
    {
      chemotherapy, chemotherapyNote, radiotherapy, radiotherapyNote,
    }: ICreateTherapy,
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
        chemotherapy,
        chemotherapy_note: chemotherapyNote,
        radiotherapy,
        radiotherapy_note: radiotherapyNote,
        created_by: currentUser?.id,
        created_at: this.knex.fn.now(),
      })
      .into(this.therapyTable);

    return id;
  }

  public async getMatchingTherapies(
    query: IMatchingTherapiesQuery,
    user: IUserWithMetadata,
  ): Promise<string[]> {
    const sameSizeCombinations = this.knex
      .select('therapyDrug.therapy_id')
      .from({ therapyDrug: this.therapyDrugTable })
      .innerJoin(
        { recommendations: this.recommendationsTable },
        'recommendations.therapy_id',
        'therapyDrug.therapy_id',
      )
      .modify(withClinicalVersion, 'innerJoin', user, 'recommendations.clinical_version_id')
      .whereNull('recommendations.deleted_at')
      .groupBy('therapyDrug.therapy_id')
      .havingRaw('count(therapyDrug.therapy_id) = ?', [query.combination.length]);

    const intersectionQueries = [sameSizeCombinations];

    for (const therapyDrug of query.combination) {
      const [classId, drugId] = therapyDrug.split('|');
      // create a query for all drugs in the provided combination list
      // the query gets the therapy id for all therapies that have both the provided drug class
      // and the provided drug (version) id
      // at this step we don't check the number of drugs in the therapy
      intersectionQueries.push(
        this.knex
          .select('therapy.id')
          .from({ therapy: this.therapyTable })
          .innerJoin({ therapyDrug: this.therapyDrugTable }, 'therapy.id', 'therapyDrug.therapy_id')
          .groupBy('therapy.id')
          .where('therapyDrug.external_drug_class_id', classId)
          .andWhere('therapyDrug.external_drug_version_id', drugId || null)
          // there is an implicit assumption in ZD that if there is no chemo or radio
          // specified, then it is not true
          .andWhere('therapy.chemotherapy', query.chemotherapy || false)
          .andWhere('therapy.radiotherapy', query.radiotherapy || false),
      );
    }

    return this.knex
      .select('therapy.id')
      .from({ therapy: this.therapyTable })
      .innerJoin(
        { recommendations: this.recommendationsTable },
        'recommendations.therapy_id',
        'therapy.id',
      )
      .modify(
        withClinicalVersion,
        'innerJoin',
        user,
        'recommendations.clinical_version_id',
      )
      .whereIn(
        'therapy.id',
        await this.knex.intersect(intersectionQueries).pluck('therapy_id'),
      )
      .pluck('therapy.id');
  }

  public async getTherapyById(therapyId: string): Promise<ITherapyBase> {
    return this.knex
      .select<ITherapy>({
        id: 'id',
        chemotherapy: 'chemotherapy',
        chemotherapyNote: 'chemotherapy_note',
        radiotherapy: 'radiotherapy',
        radiotherapyNote: 'radiotherapy_note',
      })
      .from(this.therapyTable)
      .where('id', therapyId)
      .first();
  }

  public async updateTherapy(
    therapyId: string,
    {
      chemotherapy, chemotherapyNote, radiotherapy, radiotherapyNote,
    }: UpdateTherapyDTO,
    currentUser: IUser,
  ): Promise<number> {
    return this.knex
      .update({
        chemotherapy,
        chemotherapy_note: chemotherapyNote,
        radiotherapy,
        radiotherapy_note: radiotherapyNote,
        updated_by: currentUser?.id,
        updated_at: this.knex.fn.now(),
      })
      .from(this.therapyTable)
      .where('id', therapyId);
  }

  public async openKnexTransaction(): Promise<Knex.Transaction> {
    return this.knex.transaction();
  }

  public async getOldTherapyEvidenceIds(
    cutoffDate: Date,
    compareColumn: string,
  ): Promise<string[]> {
    return this.knex(this.therapyEvidenceTable)
      .whereNotNull(compareColumn)
      .where(compareColumn, '<', cutoffDate)
      .pluck('id');
  }

  public async permanentlyDeleteTherapyEvidenceByIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (therapyIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.therapyEvidenceTable)
      .whereIn('id', therapyIds)
      .delete();
  }

  public async permanentlyDeleteTherapyDrugsByTherapyIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (therapyIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.therapyDrugTable)
      .whereIn('therapy_id', therapyIds)
      .delete();
  }

  public async permanentlyDeleteTherapiesByIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (therapyIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.therapyTable)
      .whereIn('id', therapyIds)
      .delete();
  }
}
