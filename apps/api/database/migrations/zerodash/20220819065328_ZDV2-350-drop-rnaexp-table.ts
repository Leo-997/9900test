import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable("zcc_curated_sample_somatic_rnaexp");
}


export async function down(knex: Knex): Promise<void> {
}

