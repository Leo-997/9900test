import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const trigger_name = (table, event) => `${table}_AFTER_${event}`;
  const trigger = (source_table, update_table, pkey, sid, event) => {
    const condition =
      event === 'UPDATE'
        ? 'NEW.reportable <> OLD.reportable OR (NEW.reportable is NOT NULL AND OLD.reportable is NULL) OR NEW.targetable <> OLD.targetable OR (NEW.targetable is NOT NULL AND OLD.targetable is NULL) OR NEW.pathclass <> OLD.pathclass OR (NEW.pathclass is NOT NULL AND OLD.pathclass is NULL)'
        : 'NEW.internal_id IS NOT NULL';

    return `CREATE TRIGGER \`${trigger_name(source_table, event)}\`
    AFTER ${event} ON \`${source_table}\` FOR EACH ROW BEGIN
      IF ${condition}
      THEN
        INSERT INTO \`${update_table}\`
          (\`${pkey}\`,
          \`sample_count\`,
          \`cancer_types\`,
          \`c5_count\`,
          \`c4_count\`,
          \`c3_8_count\`,
          \`c3_count\`,
          \`reported_count\`,
          \`targetable_count\`)
        VALUES
          (NEW.${pkey},
          (select count(distinct ${sid}) as \`sample_count\`
            from ${source_table}
            where ${pkey}=NEW.${pkey}),
          (select count(distinct cancer_type) as \`cancer_types\`
            from ${source_table} a
            left join zcc_sample b
            on a.${sid} = b.${sid}
            where a.${pkey} = NEW.${pkey}),
          (select count(distinct ${sid}) as \`c5_count\`
            from ${source_table}
            where pathclass like 'C5:%' and ${pkey}=NEW.${pkey}),
          (select count(distinct ${sid}) as \`c4_count\`
            from ${source_table}
            where pathclass like 'C4:%' and ${pkey}=NEW.${pkey}),
          (select count(distinct ${sid}) as \`c3_8_count\`
            from ${source_table}
            where pathclass like 'C3.8:%' and ${pkey}=NEW.${pkey}),
          (select count(distinct ${sid}) as \`c3_count\`
            from ${source_table}
            where pathclass like 'C3:%' and ${pkey}=NEW.${pkey}),
          (select count(${sid}) as \`reportable\` from ${source_table}
            where reportable is not null and reportable <> 'Not Reportable' and reportable <> '0'
            and ${pkey}=NEW.${pkey}),
          (select count(distinct ${sid}) as \`targetable\`
            from ${source_table}
            where targetable=1 and ${pkey}=NEW.${pkey}))
        ON DUPLICATE KEY UPDATE
          sample_count=VALUES(sample_count),
          cancer_types=VALUES(cancer_types),
          c5_count=VALUES(c5_count),
          c4_count=VALUES(c4_count),
          c3_8_count=VALUES(c3_8_count),
          c3_count=VALUES(c3_count),
          reported_count=VALUES(reported_count),
          targetable_count=VALUES(targetable_count);
      END IF;
    END`;
  };

  const tables = [
    {
      source: 'zcc_curated_sample_somatic_snv',
      update: 'zcc_curated_somatic_snv_counts',
      pkey: 'variant_id',
      sid: 'sample_id',
      event: 'UPDATE',
    },
    {
      source: 'zcc_curated_sample_somatic_snv',
      update: 'zcc_curated_somatic_snv_counts',
      pkey: 'variant_id',
      sid: 'sample_id',
      event: 'INSERT',
    },
    {
      source: 'zcc_curated_sample_germline_snv',
      update: 'zcc_curated_germline_snv_counts',
      pkey: 'variant_id',
      sid: 'matched_normal_id',
      event: 'UPDATE',
    },
    {
      source: 'zcc_curated_sample_germline_snv',
      update: 'zcc_curated_germline_snv_counts',
      pkey: 'variant_id',
      sid: 'matched_normal_id',
      event: 'INSERT',
    },
  ];

  return tables.reduce(
    (p, info) =>
      p.then(() =>
        knex.schema
          .raw(
            `DROP TRIGGER IF EXISTS ${trigger_name(info.source, info.event)}`,
          )
          .then(() =>
            knex.schema.raw(
              trigger(
                info.source,
                info.update,
                info.pkey,
                info.sid,
                info.event,
              ),
            ),
          ),
      ),
    Promise.resolve(),
  );
}

export async function down(knex: Knex): Promise<void> {}