import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_reports_metadata', (table) => {
    table.dropIndex(['value'], 'zcc_reports_metadata_value_index');
  }).then(() => (
    knex.schema.alterTable('zcc_reports_metadata', (table) => {
      table.text('value').alter();
    })
  ));
}

export async function down(knex: Knex): Promise<void> {
}
