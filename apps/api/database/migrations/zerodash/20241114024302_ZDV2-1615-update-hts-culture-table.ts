import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', async (table) => {
    table.string('biosample_id', 150).after('hts_id');
    table.index('biosample_id');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('hts_id'),
        })
        .from('zcc_hts_culture')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.dropForeign(['hts_id'], 'zcc_hts_drugstats_hts_id_foreign');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_hts_culture', (table) => {
        table.dropIndex(['sample_id'], 'zcc_hts_culture_sample_id_index');
        table.dropPrimary();
        table.primary(['biosample_id', 'screen_name']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_hts_culture', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_hts_culture', (table) => {
        table.dropColumn('sample_id');
        table.dropColumn('hts_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
