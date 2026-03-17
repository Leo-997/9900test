import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_diagnosis').defaultTo(0).alter();
    table.boolean('show_event').defaultTo(0).alter();
    table.boolean('show_mutation_mtb').defaultTo(0).alter();
    table.boolean('show_tumour').defaultTo(0).alter();
    table.boolean('show_germline').defaultTo(0).alter();
    table.boolean('show_som_missense_snvs').defaultTo(1).alter();
    table.boolean('show_preservation_state').defaultTo(1).after('show_som_missense_snvs');
    table.boolean('show_cohort').defaultTo(1).after('show_preservation_state');
    table.boolean('show_histological_diagnosis').defaultTo(1).after('show_cohort');
  });
}

export async function down(knex: Knex): Promise<void> {
}
