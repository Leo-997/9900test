import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { UpdateAcknowledgementDTO } from 'Models/Precuration/Requests/UpdatePrecurationValidationBody.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';

@Injectable()
export class PrecurationValidationClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  acknowledgementTable = 'zcc_qc_metrics_warning_acknowledgement';

  public async checkWarningAcknowledgement(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<boolean> {
    const resp = await this.knex
      .select({
        analysisSetId: 'a.analysis_set_id',
      })
      .from({ a: this.acknowledgementTable })
      .modify(withAnalysisSet, 'innerJoin', user, 'a.analysis_set_id')
      .where('a.analysis_set_id', analysisSetId)
      .andWhere('a.user_id', user.id);

    return resp.length > 0;
  }

  public async addWarningAcknowledgement(
    analysisSetId: string,
    userId: string,
    body: UpdateAcknowledgementDTO,
  ): Promise<void> {
    return this.knex
      .insert({
        analysis_set_id: analysisSetId,
        user_id: userId,
        acknowledged: true,
        contamination_note: body.contaminationNote,
        status_note: body.statusNote,
        acknowledgedAt: this.knex.fn.now(),
      })
      .into(this.acknowledgementTable)
      .onConflict()
      .merge()
      .returning('id');
  }
}
