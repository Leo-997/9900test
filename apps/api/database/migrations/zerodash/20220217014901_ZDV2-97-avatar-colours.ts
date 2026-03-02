import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_users', (table) => {
    table.string('avatar').defaultTo(null);
  });
}


export async function down(knex: Knex): Promise<void> {
}