import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', async (table) => {
    table.string('sequenced_event', 50).after('event_type');
  })
    .then(() => (
      knex
        .update({
          sequenced_event: knex.raw('event_type'),
        })
        .from('zcc_analysis_set')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_analysis_set', (table) => {
        table.dropColumn('event_type');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_analysis_set', (table) => {
        table.string('diagnosis_event', 50).after('sequenced_event');
        table.string('analysis_event', 50).after('diagnosis_event');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
