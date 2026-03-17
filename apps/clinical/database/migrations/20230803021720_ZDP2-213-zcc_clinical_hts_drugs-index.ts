import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_hts_drugs', (table) => {
    table.index('targets');

    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_clinical_samples')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('hts_id')
      .references('hts_id')
      .inTable('zcc_clinical_samples')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

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
