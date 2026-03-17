import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_rnaseq');
}


export async function down(knex: Knex): Promise<void> {
}

