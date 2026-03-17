import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curation_comment', (table) => {
    table
      .string('original_thread_id')
      .nullable()
      .defaultTo(null)
      .after('original_thread_type');
  });
}

export async function down(knex: Knex): Promise<void> {
}
