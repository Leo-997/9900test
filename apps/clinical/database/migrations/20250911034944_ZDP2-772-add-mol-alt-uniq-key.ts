import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.unique(
      ['clinical_version_id', 'mutation_id', 'mutation_type'],
      { indexName: 'zcc_clinical_mol_alteraion_unique' },
    );
  });
}

export async function down(knex: Knex): Promise<void> {
}
