import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
    table
      .boolean('research_candidate')
      .after('in_molecular_report');
  });
}

export async function down(knex: Knex): Promise<void> {
}
