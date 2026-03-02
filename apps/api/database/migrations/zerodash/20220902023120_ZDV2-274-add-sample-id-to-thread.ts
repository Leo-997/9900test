import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_annotation_summary_thread', table => {
    table.string('sample_id', 255).nullable().defaultTo(null).after('variant_id');
  })
}


export async function down(knex: Knex): Promise<void> {
}

