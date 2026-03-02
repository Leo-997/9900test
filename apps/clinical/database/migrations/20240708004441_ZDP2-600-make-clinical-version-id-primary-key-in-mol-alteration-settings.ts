import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.dropPrimary();
    table.primary(['clinical_version_id']);
  })
    .then(() => knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
      table.dropColumn('id');
    }));
}

export async function down(knex: Knex): Promise<void> {
}
