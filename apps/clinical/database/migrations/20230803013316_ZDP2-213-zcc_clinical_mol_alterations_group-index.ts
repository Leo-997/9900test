import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_group', (table) => {
    table
      .foreign('mol_alteration_id')
      .references('id')
      .inTable('zcc_clinical_mol_alterations')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
