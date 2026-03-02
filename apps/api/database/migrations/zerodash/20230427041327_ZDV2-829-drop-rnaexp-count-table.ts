import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('zcc_curated_somatic_rnaexp_counts');
}

export async function down(knex: Knex): Promise<void> {
}
