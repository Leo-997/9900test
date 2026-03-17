import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import {
  CreateTherapyTrial,
  ITherapyTrialBase,
  IUser,
} from 'Models';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { v4 as uuid } from 'uuid';

export class TrialsClient {
  private readonly trialsTable = 'zcc_clinical_trials';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public async getTherapyTrialsByTherapyId(therapyId: string): Promise<ITherapyTrialBase[]> {
    return this.knex
      .select({
        id: 'id',
        therapyId: 'therapy_id',
        externalTrialId: 'external_trial_id',
        note: 'note',
      })
      .from(this.trialsTable)
      .where('therapy_id', therapyId);
  }

  public async createTherapyTrial(
    therapyId: string,
    {
      externalTrialId,
      note,
    }: CreateTherapyTrial,
    currentUser: IUser,
    trx?: Knex.Transaction,
  ): Promise<void> {
    const db = trx ?? this.knex;
    await db
      .insert({
        id: uuid(),
        therapy_id: therapyId,
        external_trial_id: externalTrialId,
        note,
        created_at: db.fn.now(),
        created_by: currentUser?.id,
      })
      .into(this.trialsTable);
  }

  public async permanentlyDeleteByTherapyIds(
    therapyIds: string[],
    trx: Knex.Transaction,
  ): Promise<number> {
    if (therapyIds.length === 0) {
      return 0;
    }
    const db = trx ?? this.knex;
    return db(this.trialsTable)
      .whereIn('therapy_id', therapyIds)
      .delete();
  }
}
