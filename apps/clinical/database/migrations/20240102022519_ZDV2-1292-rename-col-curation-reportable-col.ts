import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_mol_alterations', (table) => {
    table.renameColumn('curation_reportable', 'curation_classification');
  });
}

export async function down(knex: Knex): Promise<void> {
}
