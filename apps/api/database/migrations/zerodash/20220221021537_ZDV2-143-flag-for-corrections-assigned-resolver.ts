import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_flag_for_corrections', (table) => {
    table.string('assigned_resolver').notNullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

