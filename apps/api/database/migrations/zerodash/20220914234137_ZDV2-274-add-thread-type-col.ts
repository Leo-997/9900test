import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_annotation_summary_thread', (table) => {
    table.string('type', 50);
  });
}


export async function down(knex: Knex): Promise<void> {
}

