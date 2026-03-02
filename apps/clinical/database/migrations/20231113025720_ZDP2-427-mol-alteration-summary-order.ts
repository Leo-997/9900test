import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.integer('summary_order').unsigned().after('clinical_rna_expression');
  });
}

export async function down(knex: Knex): Promise<void> {
}
