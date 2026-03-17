import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { ICorrection } from 'Models/Precuration/CorrectionFlags.model';
import { IAddCorrectionFlagBody } from 'Models/Precuration/Requests/AddCorrectionFlagBody.model';
import { UpdateCorrectionFlagBodyDTO } from 'Models/Precuration/Requests/UpdateCorrectionFlagBody.model';
import { IUser, IUserWithMetadata } from 'Models/Users/Users.model';

import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';

@Injectable()
export class CorrectionFlagsClient {
  private correctionsTable = 'zcc_flag_for_corrections';

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  private selectFlagFields(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex.select({
      reason: 'flags.reason',
      reasonNote: 'flags.reason_note',
      isCorrected: 'flags.is_corrected',
      correctionNote: 'flags.correction_note',
      flaggedById: 'flags.flagged_by',
      correctedById: 'flags.corrected_by',
      assignedResolverId: 'flags.assigned_resolver',
      flaggedAt: 'flags.flagged_at',
      correctedAt: 'flags.corrected_at',
      analysisSetId: 'flags.analysis_set_id',
      flagId: 'flags.flag_id',
    })
      .from({ flags: this.correctionsTable })
      .modify(withAnalysisSet, 'innerJoin', user, 'flags.analysis_set_id');
  }

  public async getAllCorrectionFlags(
    analysisSetId: string,
    user: IUserWithMetadata,
  ): Promise<ICorrection[]> {
    return this.selectFlagFields(user)
      .where('flags.analysis_set_id', analysisSetId);
  }

  public async getFlagById(
    id: number,
    user: IUserWithMetadata,
  ): Promise<ICorrection> {
    return this.selectFlagFields(user)
      .where({ flag_id: id })
      .first();
  }

  public async addCorrectionFlag(
    flagData: IAddCorrectionFlagBody,
    user: IUser,
  ): Promise<Record<'id', number>> {
    const {
      reason, reasonNote, assignedResolverId, analysisSetId,
    } = flagData;
    return this.knex
      .where('analysis_set_id', analysisSetId)
      .insert({
        reason,
        reason_note: reasonNote,
        analysis_set_id: analysisSetId,
        flagged_by: user.id,
        is_corrected: 0,
        assigned_resolver: assignedResolverId,
        flagged_at: this.knex.fn.now(),
      })
      .into(this.correctionsTable)
      .then(() => (
        this.knex.select({
          id: 'flag_id',
        })
          .from(this.correctionsTable)
          .where('analysis_set_id', analysisSetId)
          .orderBy('flagged_at', 'desc')
          .first()
      ));
  }

  public async updateCorrectionFlag(
    data: UpdateCorrectionFlagBodyDTO,
    flagId: number,
    currentUser: IUser,
  ): Promise<any> {
    return this.knex(this.correctionsTable)
      .where('flag_id', flagId)
      .update({
        is_corrected: data.isCorrected,
        correction_note: data.correctionNote,
        corrected_by: data.isCorrected ? currentUser.id : null,
        corrected_at: data.isCorrected ? this.knex.fn.now() : null,
        assigned_resolver: data.assignedResolver,
      });
  }
}
