import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.date('hts_seed_date').defaultTo(null).after('hts_event');
    table.date('hts_endpoint_date').defaultTo(null).after('hts_screen_date');
    table.string('version', 100).after('hts_valid_result');
    table.string('hts_event', 50).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
