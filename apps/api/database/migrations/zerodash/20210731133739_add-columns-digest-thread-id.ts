import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tables = [
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_sample_somatic_cnv',
    'zcc_curated_sample_somatic_rnaexp',
    'zcc_curated_sample_somatic_cytobandcnv',
    'zcc_curated_sample_somatic_sv',
    'zcc_curated_sample_germline_cnv',
    'zcc_curated_sample_germline_snv',
    'zcc_curated_sample_somatic_methylation',
  ];

  const runSequence = (functions) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  return runSequence(
    tables.map((table) =>
      knex.schema.alterTable(table, (tbl) => {
        tbl
          .integer('digest_thread_id', 10)
          .unsigned()
          .defaultTo(null)
          .after('comment_thread_id');
      }),
    ),
  ).catch(async (error) => {
    const promises = tables.map((table) =>
      knex.schema.hasColumn(table, 'digest_thread_id').then(() => {
        knex.schema.table(table, (t) => t.dropColumn('digest_thread_id'));
      }),
    );

    await Promise.all(promises);
    throw Error(error);
  });
}

export async function down(knex: Knex): Promise<void> {}
