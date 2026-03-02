import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('research_candidate', 50).after('ctc_candidate');

    table.index(['research_candidate'], 'idx_analysis_set_research_candidate');
  });
}

export async function down(knex: Knex): Promise<void> {
}
