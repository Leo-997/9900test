import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_snv', (table) => {
    table
      .boolean('research_candidate')
      .after('vcf_filter_pass');
  });
}

export async function down(knex: Knex): Promise<void> {
}
