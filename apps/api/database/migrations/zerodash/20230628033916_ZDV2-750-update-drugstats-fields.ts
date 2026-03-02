import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_hts_drugstats', (table) => {
    table.renameColumn('hit', 'candidate_hit');
    table.renameColumn('recommendation', 'reportable_hit');
  })
    .then(() => (
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.boolean('hit').after('reportable');
        table.dropColumn('curator_summary');
        table.dropColumn('comments');
      })
    ))
    .then(() => (
      knex('zcc_hts_drugstats')
        .update({
          hit: false,
        })
        .where('reportable', 'Not reportable')
    ))
    .then(() => (
      knex('zcc_hts_drugstats')
        .update({
          hit: true,
        })
        .whereNotNull('reportable')
        .whereNot('reportable', 'Not reportable')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_hts_drugstats', (table) => {
        table.dropColumn('reportable');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
