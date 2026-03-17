import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.renameColumn('show_tumor', 'show_tumour');
  });
}


export async function down(knex: Knex): Promise<void> {
}

