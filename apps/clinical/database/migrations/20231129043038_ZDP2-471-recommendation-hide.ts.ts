import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.boolean('is_hidden').after('slide_order').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
}
