import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample_summary_notes', (table) => {
    table.uuid('analysis_set_id').after('sample_id');

    table
      .foreign('analysis_set_id')
      .references('analysis_set_id')
      .inTable('zcc_analysis_set')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex.update({
        analysis_set_id: knex
          .select('analysis_set_id')
          .from('zcc_analysis_set_exp_xref')
          .where('biosample_id', knex.raw('??', ['notes.sample_id']))
          .first(),
      })
        .from({ notes: 'zcc_sample_summary_notes' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_sample_summary_notes', (table) => {
        table.dropPrimary();
        table.primary(['analysis_set_id', 'type']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_sample_summary_notes', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
