/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-console */
import knex from 'knex';
import { knexConnectionConfig } from '../../../knexfile';



const clinicalKnex = knex(knexConnectionConfig);
const zdKnex = knex({
  ...knexConnectionConfig,
  connection: {
    ...knexConnectionConfig.connection,
    database: 'zcczerodashhg38',
  },
});

async function migrateToAnalysisSet(): Promise<void> {
  await clinicalKnex.update({
    analysis_set_id: zdKnex
      .select('analysis_set_id')
      .from('zcczerodashhg38.zcc_analysis_set_exp_xref')
      .where('biosample_id', clinicalKnex.raw('??', ['versions.analysis_set_id']))
      .first(),
  })
    .from({ versions: 'zcc_clinical_versions' });

  process.exit(0);
}

migrateToAnalysisSet();
