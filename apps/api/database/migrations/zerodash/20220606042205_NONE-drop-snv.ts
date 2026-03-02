import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('zcc_curated_somatic_snv')
    .dropTable('zcc_curated_germline_snv');
}


export async function down(knex: Knex): Promise<void> {
}

