import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    // move columns around
    table.double('zscore_auc').after('auc_patient').alter();
    table.double('zscore_ic50').after('ic50_patient').alter();
    table.double('ic50_log2').after('ic50_median').alter();
    table.string('maximum_effect_mtc', 50).after('crew').alter();
    table.boolean('candidate_hit').after('cohort4zscore').alter();

    // add new columns
    table.double('zscore_auc_subcohort').after('auc_median');
    table.double('auc_median_subcohort').after('zscore_auc_subcohort');

    table.double('zscore_ic50_log2_subcohort').after('ic50_median');
    table.double('ic50_log2_median_subcohort').after('zscore_ic50_log2_subcohort');

    table.double('zscore_lc50_log2_subcohort').after('lc50_median');
    table.double('lc50_log2_median_subcohort').after('zscore_lc50_log2_subcohort');

    // remove columns
    table.dropColumn('cohort4zscore');
  })
    .then(() => (
      // knex seems to be generatiung a new query for rename
      // even if they are added to the same query
      // so, to avoid confusion, we are splitting them here
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.renameColumn('zscore_ic50', 'zscore_ic50_log2');
        table.renameColumn('ic50_median', 'ic50_log2_median');
        table.renameColumn('zscore_lc50', 'zscore_lc50_log2');
        table.renameColumn('lc50_median', 'lc50_log2_median');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
