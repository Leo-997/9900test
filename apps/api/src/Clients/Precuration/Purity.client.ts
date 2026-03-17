import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IPurity, IPurityFilters } from 'Models/Precuration/Purity.model';
import { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withAnalysisSet } from 'Utilities/query/accessControl/withAnalysisSet.util';

@Injectable()
export class PurityClient {
  private readonly purityTable = 'zcc_purity';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
  ) {}

  public getPurity(filters: IPurityFilters, user: IUserWithMetadata): Promise<IPurity[]> {
    return this.getPurityBase(user)
      .where(function addFilters() {
        if (filters.analysisSetId) {
          this.where('purity.analysis_set_id', filters.analysisSetId);
        }
      });
  }

  public getPurityById(id: string, user: IUserWithMetadata): Promise<IPurity> {
    return this.getPurityBase(user)
      .where('purity_id', id)
      .first();
  }

  private getPurityBase(
    user: IUserWithMetadata,
  ): Knex.QueryBuilder {
    return this.knex
      .select({
        purityId: 'purity.purity_id',
        analysisSetId: 'purity.analysis_set_id',
        purity: 'purity.purity',
        minPurity: 'purity.min_purity',
        maxPurity: 'purity.max_purity',
        ploidy: 'purity.ploidy',
        minPloidy: 'purity.min_ploidy',
        maxPloidy: 'purity.max_ploidy',
        msStatus: 'purity.ms_status',
        wgDuplication: 'purity.wg_duplication',
        createdAt: 'purity.created_at',
        updatedAt: 'purity.updated_at',
        createdBy: 'purity.created_by',
        updatedBy: 'purity.updated_by',
      })
      .from({ purity: this.purityTable })
      .modify(withAnalysisSet, 'innerJoin', user, 'purity.analysis_set_id')
      .orderBy('purity.created_at', 'desc');
  }
}
