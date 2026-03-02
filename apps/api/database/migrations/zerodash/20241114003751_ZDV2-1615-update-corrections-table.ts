import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_flag_for_corrections', (table) => {
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
          .where('biosample_id', knex.raw('??', ['flag.sample_id']))
          .first(),
      })
        .from({ flag: 'zcc_flag_for_corrections' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_flag_for_corrections', (table) => {
        table.dropIndex(['sample_id'], 'zcc_flag_for_corrections_sample_id_foreign');
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
