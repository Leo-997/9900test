import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_tumour_profile_settings', (table) => {
    table.boolean('show_msi').defaultTo(false).alter();
    table.boolean('show_loh').defaultTo(false).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
