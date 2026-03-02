import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_users', (table) => {
    table.renameColumn('email_address', 'unique_name');
    table.string('email').unique();
  });
}

export async function down(knex: Knex): Promise<void> {}
