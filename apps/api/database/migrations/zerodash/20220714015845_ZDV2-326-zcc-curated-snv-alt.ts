import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv', (table) => {
    table.string('alt', 3000).alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

