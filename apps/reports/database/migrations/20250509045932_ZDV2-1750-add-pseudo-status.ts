import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_reports', (table) => {
    table.string('pseudo_status', 50).after('status');
  });
}

export async function down(knex: Knex): Promise<void> {
}
