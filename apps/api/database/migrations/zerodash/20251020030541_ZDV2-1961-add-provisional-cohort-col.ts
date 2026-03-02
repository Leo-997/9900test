import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('provisional_cohort', 200).after('analysis_event');
  });
}

export async function down(knex: Knex): Promise<void> {
}
