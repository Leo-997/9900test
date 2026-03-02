import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('zcc_analysis_set_exp_xref', 'zcc_analysis_set_biosample_xref');

  await knex.schema.alterTable('zcc_analysis_set_biosample_xref', (table) => {
    table.string('pipeline_id', 26).defaultTo('').after('analysis_set_id');
    table.index(['pipeline_id'], 'zcc_analysis_biosample_xref_pipeline_id_idx');
  });
}

export async function down(knex: Knex): Promise<void> {
}
