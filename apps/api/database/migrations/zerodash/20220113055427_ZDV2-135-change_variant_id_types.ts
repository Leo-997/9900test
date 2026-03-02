import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tables = [
    'zcc_curated_germline_snv_counts',
    'zcc_curated_sample_germline_snv',
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_snv',
    'zcc_curated_snv_anno',
    'zcc_curated_somatic_snv_counts',
  ];
  const runSequence = (functions) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  return runSequence(
    tables.map((table) =>
      knex.schema.alterTable(table, (tbl) => {
        tbl.string('variant_id', 36).notNullable().alter();
      }),
    ),
  ).catch(async (error) => {
    const promises = tables.map((table) =>
      knex.schema.hasColumn(table, 'variant_id').then(() => {
        knex.schema.table(table, (t) => t.dropColumn('variant_id'));
      }),
    );

    await Promise.all(promises);
    throw Error(error);
  });
}

export async function down(knex: Knex): Promise<void> {}
