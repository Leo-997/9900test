/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import knex, { Knex } from 'knex';
import { knexConnectionConfig } from '../../../knexfile';



const reportsKnex = knex(knexConnectionConfig);
const zdKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection as Knex.MySql2ConnectionConfig,
    database: 'zcczerodashhg38',
  },
});

async function migrateToAnalysisSet(): Promise<void> {
  await reportsKnex.update({
    analysis_set_id: zdKnex
      .select('analysis_set_id')
      .from('zcczerodashhg38.zcc_analysis_set_exp_xref')
      .where('biosample_id', reportsKnex.raw('??', ['reports.analysis_set_id']))
      .first(),
  })
    .from({ reports: 'zcc_reports' });

  process.exit(0);
}

migrateToAnalysisSet();
