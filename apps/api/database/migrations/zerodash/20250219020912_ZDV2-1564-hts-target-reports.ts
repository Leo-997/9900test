import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.string('report_targets').after('screen_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
