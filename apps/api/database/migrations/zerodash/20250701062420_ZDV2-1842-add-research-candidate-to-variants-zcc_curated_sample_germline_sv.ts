import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_germline_sv', (table) => {
    table
      .boolean('research_candidate')
      .after('helium_updated');
  });
}

export async function down(knex: Knex): Promise<void> {
}
