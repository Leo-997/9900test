import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
    table.dropColumn('show_reported_as');
    table.boolean('show_targeted').defaultTo(false).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
