import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_seq_metrics', (table) => {
    table.dropColumn('amber_consanguinity');
  });
}

export async function down(knex: Knex): Promise<void> {
}
