import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_germline_recommendations', (table) => {
    table.integer('order');
  });
}

export async function down(knex: Knex): Promise<void> {
}
