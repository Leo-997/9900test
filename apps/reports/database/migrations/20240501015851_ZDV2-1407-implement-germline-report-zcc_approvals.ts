import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_approvals', (table) => {
    table.string('label', 50).defaultTo(null).after('role');
  });
}

export async function down(knex: Knex): Promise<void> {
}
