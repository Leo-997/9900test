import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_clinical_recommendation_alteration');
}

export async function down(knex: Knex): Promise<void> {
}
