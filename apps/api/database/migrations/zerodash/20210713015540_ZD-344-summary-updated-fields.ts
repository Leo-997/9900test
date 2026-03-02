import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_annotation_summary', (table) => {
    table.string('updated_by', 255).nullable().after('created_at');
    table.timestamp('updated_at').nullable().after('updated_by');
  });
}

export async function down(knex: Knex): Promise<void> {}
