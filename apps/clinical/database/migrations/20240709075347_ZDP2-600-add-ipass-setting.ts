import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_ipass').defaultTo(1).after('show_ploidy');
  });
}

export async function down(knex: Knex): Promise<void> {
}
