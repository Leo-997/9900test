import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.boolean('ctc_candidate').defaultTo(false).after('targetable');
  })
    .then(() => (
      knex.update({
        'aset.ctc_candidate': knex.raw('sample.ctc_candidate'),
      })
        .from({ aset: 'zcc_analysis_set' })
        .innerJoin(
          { xref: 'zcc_analysis_set_exp_xref' },
          'aset.analysis_set_id',
          'xref.analysis_set_id',
        )
        .innerJoin(
          { sample: 'zcc_sample' },
          'xref.biosample_id',
          'sample.sample_id',
        )
    ));
}

export async function down(knex: Knex): Promise<void> {
}
