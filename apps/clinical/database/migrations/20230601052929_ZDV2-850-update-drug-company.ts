import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drugs', (table) => {
    table.dropColumn('company_id');
    table.renameColumn('company_name', 'company');
  });
}

export async function down(knex: Knex): Promise<void> {
}
