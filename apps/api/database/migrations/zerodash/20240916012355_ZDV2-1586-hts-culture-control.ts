import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', async (table) => {
    table.float('control_change_ratio').defaultTo(null);
    table.float('control_error_bar_min').defaultTo(null);
    table.float('control_error_bar_max').defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
}
