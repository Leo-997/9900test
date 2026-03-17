import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable('zcc_curated_somatic_sv', 'zcc_curated_sv');
}

export async function down(knex: Knex): Promise<void> {
}
