import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void[]> {
  const createQuery = (
    tablename: string,
  ): Knex.SchemaBuilder => knex.schema.alterTable(
    tablename,
    (table) => {
      table.dropColumn('comments');
      if (tablename !== 'zcc_curated_sample_somatic_mutsig') {
        table.dropColumn('evidence');
      }
      table.dropColumn('curator_summary');
    },
  );

  const tables = [
    'zcc_curated_sample_germline_cnv',
    'zcc_curated_sample_germline_snv',
    'zcc_curated_sample_somatic_armcnv',
    'zcc_curated_sample_somatic_cnv',
    'zcc_curated_sample_somatic_cytobandcnv',
    'zcc_curated_sample_somatic_methylation',
    'zcc_curated_sample_somatic_mgmtstatus',
    'zcc_curated_sample_somatic_mutsig',
    'zcc_curated_sample_somatic_rnaseq',
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_sample_somatic_sv',
  ];

  const promises: Promise<void>[] = [];
  for (const table of tables) {
    promises.push(createQuery(table));
  }

  return Promise.all(promises);
}

export async function down(knex: Knex): Promise<void> {
}
