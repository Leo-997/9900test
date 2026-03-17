import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<number> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.string('failed_status_reason').after('curation_status');
  })
    .then(() => (
      knex
        .update({
          failed_status_reason: knex.raw('curation_status'),
          curation_status: knex.raw('curation_stage'),
        })
        .from('zcc_analysis_set')
        .where('curation_stage', 'Failed')
    ));
}

export async function down(knex: Knex): Promise<void> {
}
