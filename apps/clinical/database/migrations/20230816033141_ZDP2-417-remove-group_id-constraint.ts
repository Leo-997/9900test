import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.dropForeign('mol_alteration_group_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
