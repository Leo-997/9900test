import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_interpretation_comment', (table) => {
    table.timestamp('created_at');
    table.string('created_by');
    table.timestamp('updated_at');
    table.string('updated_by');
    table.timestamp('deleted_at');
    table.string('deleted_by');
  });
}

export async function down(knex: Knex): Promise<void> {
}
