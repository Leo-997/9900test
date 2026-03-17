import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_approvals', (table) => {
    table.timestamp('notified_at').after('updated_by');
  });
}

export async function down(knex: Knex): Promise<void> {
}
