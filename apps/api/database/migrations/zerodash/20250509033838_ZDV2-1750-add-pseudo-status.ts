import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('pseudo_status', 50).after('curation_status');
  });
}

export async function down(knex: Knex): Promise<void> {
}
