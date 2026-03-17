import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv', (table) => {
    table.string('pecan_somatic_medal', 20).defaultTo(null);
    table.string('pecan_germline_medal', 20).defaultTo(null);
  });
}


export async function down(knex: Knex): Promise<void> {
}

