import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.string('screen_name', 36).defaultTo(null).after('sample_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
