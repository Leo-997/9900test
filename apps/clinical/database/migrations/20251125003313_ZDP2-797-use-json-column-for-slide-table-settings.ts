import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_slide_table_settings', (table) => {
    table.json('settings').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
