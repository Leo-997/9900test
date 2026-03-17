import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', async (table) => {
    table.uuid('analysis_set_id').after('sample_id');
  })
    .then(() => (
      knex
        .update({
          analysis_set_id: knex.raw('sample_id'),
        })
        .from('zcc_clinical_versions')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_clinical_versions', (table) => {
        table.dropForeign(['sample_id'], 'zcc_clinical_versions_sample_id_foreign');
        table.dropColumn('sample_id');
        table.uuid('analysis_set_id').notNullable().alter();
        table.index(['analysis_set_id']);
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
