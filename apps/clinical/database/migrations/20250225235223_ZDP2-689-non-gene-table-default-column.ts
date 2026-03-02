import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
    table.boolean('show_alteration').defaultTo(1).alter();
    table.boolean('show_description').defaultTo(1).alter();
    table.boolean('show_targeted').defaultTo(0).alter();
    table.boolean('show_clinical_notes').defaultTo(0).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
