import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_clinical_recommendation_therapy');
}

export async function down(knex: Knex): Promise<void> {
}
