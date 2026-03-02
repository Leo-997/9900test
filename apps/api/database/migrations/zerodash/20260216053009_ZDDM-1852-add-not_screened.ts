import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.boolean('screened')
      .defaultTo(true)
      .after('screen_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
