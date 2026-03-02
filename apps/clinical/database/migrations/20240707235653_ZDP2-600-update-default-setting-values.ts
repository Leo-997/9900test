import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_time_to_mtb').defaultTo(0).alter();
    table.boolean('show_mutation_mtb').defaultTo(1).alter();
    table.boolean('show_sample_type').defaultTo(0).alter();
    table.boolean('show_preservation_state').defaultTo(0).alter();
    table.boolean('show_histological_diagnosis').defaultTo(0).alter();
    table.boolean('show_purity').defaultTo(1).alter();
    table.boolean('show_enrolment').defaultTo(1).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
