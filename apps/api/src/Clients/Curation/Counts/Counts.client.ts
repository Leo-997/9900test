import { Inject } from '@nestjs/common';
import { Knex } from 'knex';
import type { ICounts } from 'Models/Common/Common.model';
import type { IUserWithMetadata } from 'Models/Users/Users.model';
import { KNEX_CONNECTION } from 'Modules/Knex/constants';
import { withBiosample } from 'Utilities/query/accessControl/withBiosample.util';

export class CountsClient {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  public async getCounts(
    tableName: string,
    variantIdCol: string,
    variantId: string,
    user: IUserWithMetadata,
  ): Promise<ICounts> {
    const biosampleQuery = this.knex
      .select('biosample.biosample_id')
      .modify(withBiosample, 'from', user);

    const baseQuery = this.knex
      .countDistinct('counts.biosample_id as count')
      .from({ counts: tableName })
      .where(variantIdCol, variantId)
      .whereNotNull('classification')
      .whereIn('counts.biosample_id', biosampleQuery)
      .first();

    const [
      reportedCount,
      targetableCount,
    ] = await Promise.all([
      baseQuery.clone().where('counts.reportable', true),
      baseQuery.clone().where('counts.targetable', true),
    ]);

    return {
      reportedCount: reportedCount?.count ?? 0,
      targetableCount: targetableCount?.count ?? 0,
    };
  }
}
