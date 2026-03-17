import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void[]> {
  const createQuery = (
    tablename: string,
    dropForeign = false,
  ): Knex.SchemaBuilder => knex.schema.alterTable(
    tablename,
    (table) => {
      if (dropForeign) {
        table.dropForeign(['summary_thread_id']);
      }
      table.dropColumn('summary_thread_id');
    },
  );

  const tables = [
    { table: 'zcc_curated_sample_germline_cnv' },
    { table: 'zcc_curated_sample_germline_snv' },
    { table: 'zcc_curated_sample_somatic_cnv' },
    { table: 'zcc_curated_sample_somatic_cytobandcnv' },
    { table: 'zcc_curated_sample_somatic_methylation' },
    { table: 'zcc_curated_sample_somatic_mgmtstatus', dropForeign: true },
    { table: 'zcc_curated_sample_somatic_mutsig', dropForeign: true },
    { table: 'zcc_curated_sample_somatic_rnaseq' },
    { table: 'zcc_curated_sample_somatic_snv' },
    { table: 'zcc_curated_sample_somatic_sv' },
    { table: 'zcc_hts_drugstats', dropForeign: true },
  ];

  const promises: Promise<void>[] = [];
  for (const table of tables) {
    promises.push(createQuery(table.table, table.dropForeign));
  }

  return Promise.all(promises);
}

export async function down(knex: Knex): Promise<void> {
}
