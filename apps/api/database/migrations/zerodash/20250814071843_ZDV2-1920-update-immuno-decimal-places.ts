import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
    table.dropColumn('ipass_value');
    table.dropColumn('ipass_status');
    table.float('value', 10, 6).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curated_sample_immunoprofile', (table) => {
    table.float('value', 8, 2).alter();
    table.float('ipass_value', 8, 2).nullable();
    table.enum('ipass_status', ['T-cell infiltrated', 'Cold']).nullable();
  });
}
