import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_panel_reportable_notes', (table) => {
    table.enu('type', ['rna', 'cytogenetics', 'landscape']).notNullable().alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
