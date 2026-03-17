import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_users', (table) => {
    table.boolean('is_active').notNullable().defaultTo(true);
  });
}

export async function down(knex: Knex): Promise<void> {}
