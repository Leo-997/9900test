import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_cyto_annotation_threads');
}

export async function down(knex: Knex): Promise<void> {
}
