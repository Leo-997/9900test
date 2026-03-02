import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_reports', async (table) => {
    table.uuid('analysis_set_id').after('sample_id');
  })
    .then(() => (
      knex
        .update({
          analysis_set_id: knex.raw('sample_id'),
        })
        .from('zcc_reports')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_reports', (table) => {
        table.dropIndex(['sample_id'], 'zcc_reports_sample_id_index');
        table.dropColumn('sample_id');
        table.uuid('analysis_set_id').notNullable().alter();
        table.index(['analysis_set_id']);
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
