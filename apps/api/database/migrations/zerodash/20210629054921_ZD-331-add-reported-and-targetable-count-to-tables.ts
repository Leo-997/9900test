import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const tables = [
    'zcc_curated_somatic_cnv_counts',
    'zcc_curated_germline_cnv_counts',
    'zcc_curated_somatic_rnaexp_counts',
    'zcc_curated_somatic_armcnv_counts',
    'zcc_curated_somatic_sv_counts',
    'zcc_curated_somatic_methylation_counts',
    'zcc_curated_somatic_mutsig_counts',
  ];

  const run_sequence = (functions) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  return run_sequence(
    tables.map((table) =>
      knex.schema.alterTable(table, function addCounts(table) {
        table.integer('reported_count', 11).unsigned().defaultTo(null);
        table.integer('targetable_count', 11).unsigned().defaultTo(null);
      }),
    ),
  ).catch(async (error) => {
    const promises = tables.map((table) =>
      knex.schema.hasColumn(table, 'reported_count').then((exists) => {
        knex.schema.table(table, (t) => t.dropColumn('reported_count'));
      }),
    );

    promises.concat(
      tables.map((table) =>
        knex.schema.hasColumn(table, 'targetable_count').then((exists) => {
          knex.schema.table(table, (t) => t.dropColumn('targetable_count'));
        }),
      ),
    );

    await Promise.all(promises);
    throw Error(error);
  });
}

export async function down(knex: Knex): Promise<void> {}
