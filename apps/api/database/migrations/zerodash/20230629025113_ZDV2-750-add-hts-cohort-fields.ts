import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_culture', (table) => {
    table.integer('whole_cohort_count').after('version');
    table.string('subcohort', 50).after('whole_cohort_count');
    table.integer('subcohort_count').after('subcohort');
  });
}

export async function down(knex: Knex): Promise<void> {
}
