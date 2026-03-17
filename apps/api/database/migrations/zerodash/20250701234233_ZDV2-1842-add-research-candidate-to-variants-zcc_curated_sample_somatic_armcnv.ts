import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_armcnv', (table) => {
    table
      .boolean('research_candidate')
      .after('targetable');
  });
}

export async function down(knex: Knex): Promise<void> {
}
