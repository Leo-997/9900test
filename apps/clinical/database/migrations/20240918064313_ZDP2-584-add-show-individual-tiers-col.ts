import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.boolean('show_individual_tiers').defaultTo(null).after('is_hidden');
  });
}

export async function down(knex: Knex): Promise<void> {
}
