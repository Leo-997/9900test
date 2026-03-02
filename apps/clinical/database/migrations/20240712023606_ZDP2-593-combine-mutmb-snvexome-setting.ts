import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_tumour_mutation_mtb').defaultTo(1).after('show_ipass');
    table.dropColumns('show_mutation_mtb', 'show_som_missense_snvs');
  });
}

export async function down(knex: Knex): Promise<void> {
}
