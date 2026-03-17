import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_public_ids', (table) => {
    table.integer('zcc_sample_id');
    table.integer('zcc_subject_id');
  });
}


export async function down(knex: Knex): Promise<void> {
}

