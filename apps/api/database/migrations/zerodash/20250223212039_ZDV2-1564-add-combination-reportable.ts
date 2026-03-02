import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drug_combinations', (table) => {
    table.boolean('reportable').after('combination_effect_css');
    table.string('reporting_rationale', 50).after('reportable');
    table.string('correlation', 50).after('reporting_rationale');
  });
}

export async function down(knex: Knex): Promise<void> {
}
