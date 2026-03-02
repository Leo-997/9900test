import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_comment', (table) => {
    table.boolean('is_resolved').defaultTo(false).after('comment');
  });
}

export async function down(knex: Knex): Promise<void> {
}
