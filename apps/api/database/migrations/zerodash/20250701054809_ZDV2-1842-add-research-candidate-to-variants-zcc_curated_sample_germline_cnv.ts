import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_germline_cnv', (table) => {
    table
      .boolean('research_candidate')
      .after('pathclass');
  });
}

export async function down(knex: Knex): Promise<void> {
}
