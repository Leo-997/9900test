import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trigger_name = (table: string, event: 'INSERT' | 'UPDATE') => `${table}_AFTER_${event}`;
  const trigger = (
    source_table: string,
    update_table: string, 
    pkeys: string[], 
    sid: string, 
    event: 'INSERT' | 'UPDATE'
  ) => {
    const keys_list = pkeys.map((p) => `\`${p}\``).join(', ');
    const values_list = pkeys.map((p) => `new.${p}`).join(', ');
    const pk_conditions =
      source_table === 'zcc_curated_sample_somatic_rnaseq'
        ? pkeys.map((p) => `${p}=new.${p}`).join(' and ') + ' and outlier'
        : pkeys.map((p) => `${p}=new.${p}`).join(' and ');

    const condition =
      event === 'UPDATE'
        ? 'NEW.reportable <> OLD.reportable OR (NEW.reportable is NOT NULL AND OLD.reportable is NULL) OR NEW.targetable <> OLD.targetable OR (NEW.targetable is NOT NULL AND OLD.targetable is NULL)'
        : `NEW.${sid} IS NOT NULL`;

    return `CREATE TRIGGER \`${trigger_name(source_table, event)}\`
      AFTER ${event} ON \`${source_table}\` FOR EACH ROW BEGIN
        IF ${condition}
        THEN
          INSERT LOW_PRIORITY INTO \`${update_table}\`
              (${keys_list},
              \`sample_count\`,
              \`cancer_types\`,
              \`reported_count\`,
              \`targetable_count\`)
          VALUES
              (${values_list},
                (select count(distinct ${sid}) as \`sample_count\`
                  from ${source_table}
                  where ${pk_conditions}),
                (select count(distinct zero2_subcategory1) as \`cancer_types\`
                  from ${source_table} a
                  left join zcc_sample b
                  on a.${sid} = b.${sid}
                  where ${pk_conditions}),
                (select count(distinct ${sid}) as \`reported_count\` from ${source_table}
                where reportable is not null and reportable <> 'Not Reportable' and reportable <> '0' and ${pk_conditions}),
                (select count(distinct ${sid}) as \`targetable_count\` from ${source_table}
                  where targetable=1 and ${pk_conditions}))
          ON DUPLICATE KEY UPDATE
                sample_count=VALUES(sample_count),
                cancer_types=VALUES(cancer_types),
                reported_count=VALUES(reported_count),
                targetable_count=VALUES(targetable_count);
        END IF;
      END`;
  };

  const tables = [
    {
      update: 'zcc_curated_germline_cnv_counts',
      source: 'zcc_curated_sample_germline_cnv',
      pkeys: ['gene_id', 'cn_type'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_armcnv_counts',
      source: 'zcc_curated_sample_somatic_armcnv',
      pkeys: ['chr', 'arm', 'cn_type'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_cnv_counts',
      source: 'zcc_curated_sample_somatic_cnv',
      pkeys: ['gene_id', 'cn_type'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_methylation_counts',
      source: 'zcc_curated_sample_somatic_methylation',
      pkeys: ['meth_group_id'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_mutsig_counts',
      source: 'zcc_curated_sample_somatic_mutsig',
      pkeys: ['signature'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_curated_somatic_sv_counts',
      source: 'zcc_curated_sample_somatic_sv',
      pkeys: ['variant_id'],
      sid: 'sample_id',
    },
    {
      update: 'zcc_rnaseq_counts',
      source: 'zcc_curated_sample_somatic_rnaseq',
      pkeys: ['gene_id'],
      sid: 'rnaseq_id',
    },
  ];

  const run_sequence = (functions: Knex.SchemaBuilder[]) =>
    functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  const add_trigger = (t: typeof tables[0], event: 'INSERT' | 'UPDATE') =>
    knex.schema
      .raw(`DROP TRIGGER IF EXISTS ${trigger_name(t.source, event)}`)
      .raw(trigger(t.source, t.update, t.pkeys, t.sid, event));

  return run_sequence(tables.map((t) => add_trigger(t, 'INSERT'))).then(() =>
    run_sequence(tables.map((t) => add_trigger(t, 'UPDATE'))),
  );
}

export async function down(knex: Knex): Promise<void> {}
