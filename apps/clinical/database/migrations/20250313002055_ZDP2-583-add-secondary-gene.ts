import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.string('secondary_gene').nullable().after('gene_id');
    table.string('secondary_gene_id').nullable().after('secondary_gene');
  });
}

export async function down(knex: Knex): Promise<void> {
}
