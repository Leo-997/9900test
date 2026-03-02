import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
    table.boolean('show_clinical_notes').defaultTo(false).after('show_high_relapse_risk');
  });
}

export async function down(knex: Knex): Promise<void> {
}
