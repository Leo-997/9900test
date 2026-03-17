import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.string('drug_id').alter();

    table.primary(['hts_id', 'drug_id']);
    table.unique(['sample_id', 'drug_id']);
  })
    .then(() => (
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.renameColumn('drug_id', 'screen_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
