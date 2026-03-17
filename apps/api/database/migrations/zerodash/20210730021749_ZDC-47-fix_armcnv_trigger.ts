import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trigger_name = (table, event) => `${table}_AFTER_${event}`;
  const trigger = (source_table, update_table, pkeys, sid, event) => {
    const keys_noquote = pkeys.join(', ');
    const keys_list = pkeys.map((p) => `\`${p}\``).join(', ');
    const values_list = pkeys.map((p) => `new.${p}`).join(', ');
    const pk_conditions = pkeys.map((p) => `${p}=new.${p}`).join(' and ');

    return `CREATE TRIGGER \`${trigger_name(source_table, event)}\`
      AFTER ${event} ON \`${source_table}\` FOR EACH ROW BEGIN
        INSERT INTO \`${update_table}\`
            (${keys_list},
            \`sample_count\`,
            \`cancer_types\`,
            \`reported_count\`,
            \`targetable_count\`)
        VALUES
            (${values_list},
              (select count(distinct ${keys_noquote}) as \`sample_count\`
                from ${source_table}
                where ${pk_conditions}),
              (select count(distinct cancer_type) as \`cancer_types\`
                from ${source_table} a
                left join zcc_sample b
                on a.${sid} = b.${sid}
                where ${pk_conditions}),
              (select count(distinct ${keys_noquote}) as \`reportable\` from ${source_table}
                where reportable is not null and reportable <> 'Not reportable' and ${pk_conditions}),
              (select count(distinct ${keys_noquote}) as \`targetable\` from ${source_table}
                where targetable=1 and ${pk_conditions}))
        ON DUPLICATE KEY UPDATE
            reported_count=VALUES(reported_count),
            targetable_count=VALUES(targetable_count);
      END`;
  };

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
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_rnaexp_counts',
      source: 'zcc_curated_sample_somatic_rnaexp',
      pkeys: ['gene_id'],
      sid: 'rnaseq_id',
    },
    {
      update: 'zcc_curated_somatic_armcnv_counts',
      source: 'zcc_curated_sample_somatic_armcnv',
      pkeys: ['chr', 'arm', 'cn_type'],
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
    knex.schema
      .raw(`DROP TRIGGER IF EXISTS ${trigger_name(t.source, event)}`)
      .raw(trigger(t.source, t.update, t.pkeys, t.sid, event));

  return run_sequence(tables.map((t) => add_trigger(t, 'INSERT'))).then(() =>
    run_sequence(tables.map((t) => add_trigger(t, 'UPDATE'))),
  );
}

export async function down(knex: Knex): Promise<void> {}
