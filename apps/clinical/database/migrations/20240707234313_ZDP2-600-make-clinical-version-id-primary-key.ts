import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
    table.dropPrimary();
    table.primary(['clinical_version_id']);
  })
    .then(() => knex.schema.alterTable('zcc_clinical_non_gene_mol_alterations_settings', (table) => {
      table.dropColumn('id');
    }))
    .then(() => knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
      table.dropPrimary();
      table.primary(['clinical_version_id']);
    }))
    .then(() => knex.schema.alterTable('zcc_clinical_mol_alterations_settings', (table) => {
      table.dropColumn('id');
    }));
}

export async function down(knex: Knex): Promise<void> {
}
