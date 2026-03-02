import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_som_missense_snvs').defaultTo(null).after('show_loh');
  });
}

export async function down(knex: Knex): Promise<void> {
}
