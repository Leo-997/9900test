import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.timestamp('curation_started_at').after('failed_status_reason');
    table.timestamp('case_finalised_at').after('curation_finalised_at');
    table.timestamp('curation_finalised_at').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
