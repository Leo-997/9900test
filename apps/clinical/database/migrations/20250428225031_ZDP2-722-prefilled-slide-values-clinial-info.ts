import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
    table.boolean('show_purity').defaultTo(false).alter();
    table.boolean('show_ipass').defaultTo(false).alter();
    table.boolean('show_tumour_mutation_mtb').defaultTo(false).alter();
  })
    .then(() => (
      knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', async (table) => {
        table.boolean('show_tumour_mutation_mb').after('show_tumour_mutation_mtb').defaultTo(false);
      })
        .then(() => (
          knex
            .update({
              show_tumour_mutation_mb: knex.raw('show_tumour_mutation_mtb'),
            })
            .from('zcc_clinical_patient_diagnosis_settings')
        ))
        .then(() => (
          knex.schema.alterTable('zcc_clinical_patient_diagnosis_settings', (table) => {
            table.dropColumn('show_tumour_mutation_mtb');
          })
        ))
    ));
}

export async function down(knex: Knex): Promise<void> {
}
