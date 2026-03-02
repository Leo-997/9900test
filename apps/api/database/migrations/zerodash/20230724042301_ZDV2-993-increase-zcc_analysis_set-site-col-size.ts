import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('sample_site').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
