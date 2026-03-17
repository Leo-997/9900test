import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curation_meeting_samples', (table) => {
    table.uuid('analysis_set_id').after('meeting_id');

    table
      .foreign('analysis_set_id')
      .references('analysis_set_id')
      .inTable('zcc_analysis_set')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex.schema.alterTable('zcc_curation_meeting_samples', (table) => {
        table.integer('meeting_id').unsigned().notNullable().alter();

        table
          .foreign('meeting_id')
          .references('meeting_id')
          .inTable('zcc_curation_meeting')
          .onDelete('CASCADE')
          .onUpdate('CASCADE');
      })
    ))
    .then(() => (
      knex.update({
        analysis_set_id: knex
          .select('analysis_set_id')
          .from('zcc_analysis_set_exp_xref')
          .where('biosample_id', knex.raw('??', ['meetingSamples.sample_id']))
          .first(),
      })
        .from({ meetingSamples: 'zcc_curation_meeting_samples' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curation_meeting_samples', (table) => {
        table.unique(['analysis_set_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curation_meeting_samples', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
