import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const createQuery = (
    tablename: string,
  ): Knex.SchemaBuilder => knex.schema.alterTable(
    tablename,
    (table) => {
      table.dropColumn('digest_thread_id');
    },
  );

  const tables = [
    'zcc_curated_sample_germline_cnv',
    'zcc_curated_sample_germline_snv',
    'zcc_curated_sample_somatic_cnv',
    'zcc_curated_sample_somatic_cytobandcnv',
    'zcc_curated_sample_somatic_methylation',
    'zcc_curated_sample_somatic_snv',
    'zcc_curated_sample_somatic_sv',
  ];

  const promises: Promise<void>[] = [];
  for (const table of tables) {
    promises.push(createQuery(table));
  }

  return Promise.all(promises)
    .then(
      () => knex.schema.dropTable('zcc_annotation_digest')
        .then(() => knex.schema.dropTable('zcc_annotation_digest_thread')),
    );
}

export async function down(knex: Knex): Promise<void> {
}
