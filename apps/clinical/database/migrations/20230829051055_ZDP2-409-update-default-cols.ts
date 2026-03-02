import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
    table.boolean('show_pathway').defaultTo(false).alter();
    table.boolean('show_reported_as').defaultTo(false).alter();
    table.boolean('show_clinical_notes').defaultTo(true).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
