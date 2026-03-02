import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_annotation_summary', (table) => {
    table.string('type', 30);
  });
}


export async function down(knex: Knex): Promise<void> {
}

