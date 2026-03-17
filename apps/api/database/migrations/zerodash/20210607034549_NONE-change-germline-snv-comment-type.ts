import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_germline_snv',
    function updateCommentType(table) {
      table.text('comments').defaultTo(null).alter();
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
