import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_clinical_samples')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('patient_id')
      .references('patient_id')
      .inTable('zcc_clinical_patients')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
