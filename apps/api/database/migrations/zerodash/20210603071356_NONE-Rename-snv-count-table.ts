import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable(
    'zcc_curated_somatic_snv_counts',
    'zcc_methylation_tracking',
  );
}

export async function down(knex: Knex): Promise<void> {}
