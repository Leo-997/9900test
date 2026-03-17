import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.boolean('in_report').defaultTo(false).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
