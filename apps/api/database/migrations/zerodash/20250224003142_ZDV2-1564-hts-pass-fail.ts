import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.string('screen_status', 20).after('qc_status');
  });
}

export async function down(knex: Knex): Promise<void> {
}
