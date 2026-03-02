import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_comment', (table) => {
    table.index('entity_id');
    table.index('entity_type');

    table
      .foreign('comment_thread_id')
      .references('id')
      .inTable('zcc_clinical_comment_thread')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
