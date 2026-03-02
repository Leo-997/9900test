import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curation_comment', (table) => {
    table.dropColumn('comment');
  });
}

export async function down(knex: Knex): Promise<void> {
}
