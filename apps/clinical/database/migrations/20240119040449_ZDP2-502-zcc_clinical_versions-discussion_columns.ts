import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.integer('discussion_columns').unsigned().defaultTo(1).after('discussion_note');
  });
}

export async function down(knex: Knex): Promise<void> {
}
