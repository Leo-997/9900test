import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('cohort_rationale', 255).nullable().after('cohort');
    table.string('met_disease', 45).nullable().after('sample_met_site');
  });
}

export async function down(knex: Knex): Promise<void> {
}
