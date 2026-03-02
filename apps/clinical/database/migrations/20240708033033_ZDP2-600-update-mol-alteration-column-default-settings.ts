import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
    table.boolean('show_prognostic_factor').defaultTo(0).alter();
  })
    .then(() => knex.schema.alterTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
      table.boolean('show_targeted').defaultTo(1).alter();
    }));
}

export async function down(knex: Knex): Promise<void> {
}
