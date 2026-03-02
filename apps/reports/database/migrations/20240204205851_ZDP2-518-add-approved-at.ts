import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_reports', (table) => {
    table.timestamp('approved_at').after('status').defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
}
