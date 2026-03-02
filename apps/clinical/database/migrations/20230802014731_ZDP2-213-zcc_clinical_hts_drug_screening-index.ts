import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_hts_drug_screening', (table) => {
    table
      .foreign('drug_id')
      .references('id')
      .inTable('zcc_clinical_drugs')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
