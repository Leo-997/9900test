import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_citation', table => {
    table.text('authors').alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

