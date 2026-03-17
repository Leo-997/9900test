import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slides', (table) => {
    table
      .foreign('mol_alteration_group_id')
      .references('group_id')
      .inTable('zcc_clinical_mol_alterations_group')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
