import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const triggerName = (table: string, event: 'INSERT' | 'UPDATE'): string => `${table}_AFTER_${event}`;
  const trigger = (
    sourceTable: string,
    updateTable: string,
    pkeys: string[],
    sid: string,
    event: 'INSERT' | 'UPDATE',
  ): string => {
    const keysList = pkeys.map((p) => `\`${p}\``).join(', ');
    const valuesList = pkeys.map((p) => `new.${p}`).join(', ');
    const pkConditions = sourceTable === 'zcc_curated_sample_somatic_rnaseq'
      ? `${pkeys.map((p) => `${p}=new.${p}`).join(' and ')} and outlier`
      : pkeys.map((p) => `${p}=new.${p}`).join(' and ');

    const condition = event === 'UPDATE'
      ? 'NEW.reportable <> OLD.reportable OR (NEW.reportable is NOT NULL AND OLD.reportable is NULL) OR NEW.targetable <> OLD.targetable OR (NEW.targetable is NOT NULL AND OLD.targetable is NULL)'
      : `NEW.${sid} IS NOT NULL`;

    return `CREATE TRIGGER \`${triggerName(sourceTable, event)}\`
      AFTER ${event} ON \`${sourceTable}\` FOR EACH ROW BEGIN
        IF ${condition}
        THEN
          INSERT LOW_PRIORITY INTO \`${updateTable}\`
              (${keysList},
              \`sample_count\`,
              \`cancer_types\`,
              \`reported_count\`,
              \`targetable_count\`)
          VALUES
              (${valuesList},
                (select count(distinct ${sid}) as \`sample_count\`
                  from ${sourceTable}
                  where ${pkConditions}),
                (select count(distinct zero2_subcategory1) as \`cancer_types\`
                  from ${sourceTable} a
                  left join zcc_sample b
                  on a.${sid} = b.${sid}
                  where ${pkConditions}),
                  (select count(distinct ${sid}) as \`reported_count\` from ${sourceTable}
                    where reportable = 1 and ${pkConditions}),
                  (select count(distinct ${sid}) as \`targetable_count\` from ${sourceTable}
                    where targetable = 1 and ${pkConditions}))
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
      update: 'zcc_curated_somatic_rnaseq_counts',
      source: 'zcc_curated_sample_somatic_rnaseq',
      pkeys: ['gene_id'],
      sid: 'rnaseq_id',
    },
    {
      update: 'zcc_curated_methylation_genes_counts',
      source: 'zcc_curated_sample_methylation_genes',
      pkeys: ['gene_id'],
      sid: 'meth_sample_id',
    },
  ];

  const runSequence = (functions: Knex.SchemaBuilder[]): Promise<void> => (
    functions.reduce((p, func) => p.then(() => func), Promise.resolve())
  );

  const addTrigger = (t: typeof tables[0], event: 'INSERT' | 'UPDATE'): Knex.SchemaBuilder => knex.schema
    .raw(`DROP TRIGGER IF EXISTS ${triggerName(t.source, event)}`)
    .raw(trigger(t.source, t.update, t.pkeys, t.sid, event));

  return runSequence(tables.map((t) => addTrigger(t, 'INSERT'))).then(() => runSequence(tables.map((t) => addTrigger(t, 'UPDATE'))));
}

export async function down(): Promise<void> {}
