import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    `zcc_sample_curation_summary_notes`,
    function addSummaryBoxSections(table) {
      table
        .text('clinical_info_progress_text')
        .defaultTo(null)
        .after('cytogenetics_summary');
      table
        .text('conclusions_text')
        .defaultTo(null)
        .after('clinical_info_progress_text');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
