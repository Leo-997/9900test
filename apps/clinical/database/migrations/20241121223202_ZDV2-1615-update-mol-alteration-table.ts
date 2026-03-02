import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.dropForeign(['sample_id']);
    table.dropForeign(['patient_id']);
    table.dropColumns('sample_id', 'patient_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
