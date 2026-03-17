import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_evidences', (table) => {
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
          .where('biosample_id', knex.raw('??', ['evidence.sample_id']))
          .first(),
      })
        .from({ evidence: 'zcc_evidences' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_evidences', (table) => {
        table.dropUnique(['external_id', 'sample_id', 'entity_id', 'entity_type'], 'zcc_evidences_unique_link');
        table.dropColumn('sample_id');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_evidences', (table) => {
        table.unique(['external_id', 'analysis_set_id', 'entity_id', 'entity_type'], { indexName: 'zcc_evidences_unique_link' });
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
