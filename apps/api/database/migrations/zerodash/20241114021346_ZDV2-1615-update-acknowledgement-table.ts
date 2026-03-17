import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_qc_metrics_warning_acknowledgement', (table) => {
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
          .where('biosample_id', knex.raw('??', ['acknowledgement.sample_id']))
          .first(),
      })
        .from({ acknowledgement: 'zcc_qc_metrics_warning_acknowledgement' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_qc_metrics_warning_acknowledgement', (table) => {
        table.dropPrimary();
        table.primary(['analysis_set_id', 'user_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_qc_metrics_warning_acknowledgement', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
