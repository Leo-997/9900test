import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_annotation_summary', (table) => {
    table.boolean('is_hidden').defaultTo(false).after('is_deleted');
  });
}

export async function down(knex: Knex): Promise<void> {}
