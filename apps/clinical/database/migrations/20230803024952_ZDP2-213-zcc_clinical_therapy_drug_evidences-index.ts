import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapy_drug_evidences', (table) => {
    table
      .foreign('therapy_drug_id')
      .references('id')
      .inTable('zcc_clinical_therapy_drugs')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
