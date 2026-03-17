import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_therapy_alteration', (table) => {
    table
      .foreign('mol_alteration_id')
      .references('id')
      .inTable('zcc_clinical_mol_alterations')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('therapy_id')
      .references('id')
      .inTable('zcc_clinical_therapies')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
