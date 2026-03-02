import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_clinical_hts_drug_screening');
}

export async function down(knex: Knex): Promise<void> {
}
