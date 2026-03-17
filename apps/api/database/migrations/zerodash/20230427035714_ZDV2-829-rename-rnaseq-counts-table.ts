import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable(
    'zcc_rnaseq_counts',
    'zcc_curated_somatic_rnaseq_counts',
  );
}

export async function down(knex: Knex): Promise<void> {
}
