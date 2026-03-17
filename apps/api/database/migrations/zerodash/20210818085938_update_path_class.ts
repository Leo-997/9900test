import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tables = [
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_sample_somatic_cnv',
    'zcc_curated_sample_somatic_sv',
    'zcc_curated_sample_germline_cnv',
    'zcc_curated_sample_germline_snv',
  ];

  const runSequence = (functions) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  return runSequence(
    tables.map((table) =>
      knex.schema.alterTable(table, (tbl) => {
        tbl.string('pathclass', 50).defaultTo(null).alter();
      }),
    ),
  ).catch(async (error) => {
    const promises = tables.map((table) =>
      knex.schema.hasColumn(table, 'pathclass').then(() => {
        knex.schema.table(table, (t) => t.dropColumn('pathclass'));
      }),
    );

    await Promise.all(promises);
    throw Error(error);
  });
}

export async function down(knex: Knex): Promise<void> {}
