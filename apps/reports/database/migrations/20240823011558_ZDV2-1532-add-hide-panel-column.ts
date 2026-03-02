import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_reports', (table) => {
    table.boolean('hide_panel').after('file_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
