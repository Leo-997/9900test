import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curation_comment_thread', (table) => {
    table.uuid('analysis_set_id').after('thread_type');

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
          .where('biosample_id', knex.raw('??', ['thread.sample_id']))
          .first(),
      })
        .from({ thread: 'zcc_curation_comment_thread' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curation_comment_thread', (table) => {
        table.dropUnique(['sample_id', 'entity_id', 'entity_type', 'thread_type'], 'zcc_curation_comment_thread_unique');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curation_comment_thread', (table) => {
        table.unique(['analysis_set_id', 'entity_id', 'entity_type', 'thread_type'], { indexName: 'zcc_curation_comment_thread_unique' });
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curation_comment_thread', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
