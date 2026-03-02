import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.string('title').defaultTo(null).after('type');
  });
}

export async function down(knex: Knex): Promise<void> {
}
