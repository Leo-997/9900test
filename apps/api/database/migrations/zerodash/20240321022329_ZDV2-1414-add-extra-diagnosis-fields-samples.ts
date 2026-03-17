import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('cohort_rationale', 255).nullable().after('cohort');
    table.string('sample_met_site', 45).nullable().after('sample_site');
    table.string('met_disease', 45).nullable().after('sample_met_site');
  });
}

export async function down(knex: Knex): Promise<void> {
}
