import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('datafiles', (table) => {
    table.bigInteger('filesize').unsigned().alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

