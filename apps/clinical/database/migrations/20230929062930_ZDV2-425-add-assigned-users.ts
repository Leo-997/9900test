import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.uuid('curator_id').after('sample_id');
    table.uuid('cancer_geneticist_id').after('clinician_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
