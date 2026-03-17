import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.index('curation_status');
    table.index('sequenced_event');
  });
}

export async function down(knex: Knex): Promise<void> {
}
