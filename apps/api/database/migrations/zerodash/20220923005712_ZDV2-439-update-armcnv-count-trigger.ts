import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  const trigger_name = (table: string, event: 'UPDATE' | 'INSERT') => `${table}_AFTER_${event}`;
  const query = (update_table: string, keys: string, values: string, source_table: string, sid: string, pk_conditions: string) => `
    INSERT LOW_PRIORITY INTO \`${update_table}\`
      (${keys},
      \`sample_count\`,
      \`cancer_types\`,
      \`reported_count\`,
      \`targetable_count\`)
    VALUES
        (${values},
          (select count(distinct ${sid}) as \`sample_count\`
            from ${source_table}
            where ${pk_conditions}),
          (select count(distinct cancer_type) as \`cancer_types\`
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
    `
  
  const trigger = (source_table: string, update_table: string, pkeys: string[], sid: string, event: 'UPDATE' | 'INSERT') => {
    const keys_list = pkeys.map((p) => `\`${p}\``).join(', ');
    const values_list = pkeys.map((p) => `new.${p}`).join(', ');
    const old_values_list = pkeys.map((p) => `old.${p}`).join(', ');
    const pk_conditions = pkeys.map((p) => `${p}=new.${p}`).join(' and ');
    const old_pk_conditions = pkeys.map((p) => `${p}=old.${p}`).join(' and ');

    const condition =
      event === 'UPDATE'
        ? 'NEW.reportable <> OLD.reportable OR (NEW.reportable is NOT NULL AND OLD.reportable is NULL) OR NEW.targetable <> OLD.targetable OR (NEW.targetable is NOT NULL AND OLD.targetable is NULL) or NEW.cn_type <> OLD.cn_type'
        : `NEW.${sid} IS NOT NULL`;

    return `CREATE TRIGGER \`${trigger_name(source_table, event)}\`
      AFTER ${event} ON \`${source_table}\` FOR EACH ROW BEGIN
        IF ${condition}
        THEN
          ${query(update_table, keys_list, values_list, source_table, sid, pk_conditions)}
        END IF;
        ${ event === 'UPDATE' ? `
          IF NEW.cn_type <> OLD.cn_type AND OLD.cn_type IS NOT NULL
          THEN
            ${query(update_table, keys_list, old_values_list, source_table, sid, old_pk_conditions)}
          END IF;
        ` : ''}
      END`;
  };

  const tables = [
    {
      update: 'zcc_curated_somatic_armcnv_counts',
      source: 'zcc_curated_sample_somatic_armcnv',
      pkeys: ['chr', 'arm', 'cn_type'],
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


export async function down(knex: Knex): Promise<void> {
}

