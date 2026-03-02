import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('cohort', 200).after('event_type');
    table.boolean('high_risk').after('cohort');
    table.string('curation_stage', 50).after('ncit_code');
  });
}


export async function down(knex: Knex): Promise<void> {
}

