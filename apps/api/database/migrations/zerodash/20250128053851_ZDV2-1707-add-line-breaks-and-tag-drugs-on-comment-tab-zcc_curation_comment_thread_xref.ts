import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curation_comment_thread_xref', (table) => {
    table.boolean('report_line_break').after('report_order').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
}
