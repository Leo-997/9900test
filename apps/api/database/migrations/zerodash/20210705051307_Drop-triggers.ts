import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trigger_name = (table, event) => `${table}_AFTER_${event}`;

  const tables = [
    {
      update: 'zcc_curated_somatic_cnv_counts',
      source: 'zcc_curated_sample_somatic_cnv',
      pkeys: ['gene_id', 'cn_type'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_germline_cnv_counts',
      source: 'zcc_curated_sample_germline_cnv',
      pkeys: ['gene_id', 'cn_type'],
      sid: 'matched_normal_id',
    },
    {
      update: 'zcc_curated_somatic_rnaexp_counts',
      source: 'zcc_curated_sample_somatic_rnaexp',
      pkeys: ['gene_id'],
      sid: 'gene_id',
    },
    {
      update: 'zcc_curated_somatic_armcnv_counts',
      source: 'zcc_curated_sample_somatic_armcnv',
      pkeys: ['chr', 'arm'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_sv_counts',
      source: 'zcc_curated_sample_somatic_sv',
      pkeys: ['variant_id'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_methylation_counts',
      source: 'zcc_curated_sample_somatic_methylation',
      pkeys: ['meth_class_id'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_mutsig_counts',
      source: 'zcc_curated_sample_somatic_mutsig',
      pkeys: ['signature'],
      sid: 'sample_id',
    },
  ];

  const run_sequence = (functions) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  const add_trigger = (t: typeof tables[0], event) =>
    knex.schema.raw(`DROP TRIGGER IF EXISTS ${trigger_name(t.source, event)}`);

  return run_sequence(tables.map((t) => add_trigger(t, 'INSERT'))).then(() =>
    run_sequence(tables.map((t) => add_trigger(t, 'UPDATE'))),
  );
}

export async function down(knex: Knex): Promise<void> {}
