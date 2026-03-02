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
    const pkConditions = pkeys.map((p) => `${p}=new.${p}`).join(' and ');

    const condition = event === 'UPDATE'
      ? `
          NEW.pathclass <> OLD.pathclass 
          OR (NEW.pathclass is NOT NULL AND OLD.pathclass is NULL) 
          OR (NEW.pathclass is NULL AND OLD.pathclass is NOT NULL)
          OR NEW.reportable <> OLD.reportable 
          OR (NEW.reportable is NOT NULL AND OLD.reportable is NULL) 
          OR (NEW.reportable is NULL AND OLD.reportable is NOT NULL)
          OR NEW.targetable <> OLD.targetable
          OR (NEW.targetable is NOT NULL AND OLD.targetable is NULL)
          OR (NEW.targetable is NULL AND OLD.targetable is NOT NULL)
        `
      : `NEW.${sid} IS NOT NULL`;

    return `CREATE TRIGGER \`${triggerName(sourceTable, event)}\`
      AFTER ${event} ON \`${sourceTable}\` FOR EACH ROW BEGIN
        IF ${condition}
        THEN
          INSERT LOW_PRIORITY INTO \`${updateTable}\` (
            ${keysList},
            \`c5_count\`,
            \`c4_count\`,
            \`c3_8_count\`,
            \`c3_count\`,
            \`reported_count\`,
            \`targetable_count\`)
          VALUES (
            ${valuesList},
            (
              select count(distinct ${sid}) as \`c5_count\`
              from ${sourceTable}
              where pathclass like 'C5:%' 
                and ${pkConditions}
            ),
            (
              select count(distinct ${sid}) as \`c4_count\`
              from ${sourceTable}
              where pathclass like 'C4:%' 
                and ${pkConditions}
            ),
            (
              select count(distinct ${sid}) as \`c3_8_count\`
              from ${sourceTable}
              where pathclass like 'C3.8:%' 
                and ${pkConditions}
            ),
            (
              select count(distinct ${sid}) as \`c3_count\`
              from ${sourceTable}
              where pathclass like 'C3:%' 
                and ${pkConditions}
            ),
            (
              select count(distinct ${sid}) as \`reported_count\`
              from ${sourceTable}
              where reportable = 1
                and ${pkConditions}
            ),
            (
              select count(distinct ${sid}) as \`targetable_count\`
              from ${sourceTable}
              where targetable = 1
                and ${pkConditions}
            )
          )
          ON DUPLICATE KEY UPDATE
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
      update: 'zcc_curated_germline_snv_counts',
      source: 'zcc_curated_sample_germline_snv',
      pkeys: ['variant_id'],
      sid: 'matched_normal_id',
    },
  ];

  const runSequence = (
    functions: Knex.SchemaBuilder[],
  ): Promise<void> => functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  const addTrigger = (
    t: typeof tables[0],
    event: 'INSERT' | 'UPDATE',
  ): Knex.SchemaBuilder => knex.schema
    .raw(`DROP TRIGGER IF EXISTS ${triggerName(t.source, event)}`)
    .raw(trigger(t.source, t.update, t.pkeys, t.sid, event));

  return runSequence(tables.map((t) => addTrigger(t, 'INSERT')))
    .then(() => runSequence(tables.map((t) => addTrigger(t, 'UPDATE'))));
}

export async function down(knex: Knex): Promise<void> {
}
