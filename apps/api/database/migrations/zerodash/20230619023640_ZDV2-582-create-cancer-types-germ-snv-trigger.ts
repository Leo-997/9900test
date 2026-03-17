import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const triggerName = (table: string): string => `${table}_AFTER_INSERT`;
  const trigger = (
    sourceTable: string,
    updateTable: string,
    pkeys: string[],
  ): string => {
    const keysList = pkeys.map((p) => `\`${p}\``).join(', ');
    const valuesList = pkeys.map((p) => `new.${p}`).join(', ');
    const pkConditions = pkeys.map((p) => `${p}=new.${p}`).join(' and ');

    return `CREATE TRIGGER \`${triggerName(sourceTable)}\`
      AFTER INSERT ON \`${sourceTable}\` FOR EACH ROW BEGIN
        INSERT LOW_PRIORITY INTO \`${updateTable}\` (
          ${keysList},
          \`cancer_types\`
        )
        VALUES (
          ${valuesList},
          (
            select count(distinct zero2_subcategory1) as \`cancer_types\`
            from ${sourceTable} a
            where ${pkConditions}
          )
        )
        ON DUPLICATE KEY UPDATE
          cancer_types=VALUES(cancer_types);
      END`;
  };

  const tables = [
    {
      update: 'zcc_curated_germline_snv_counts',
      source: 'zcc_curated_germline_snv_subcat1_xref',
      pkeys: ['variant_id'],
    },
  ];

  const runSequence = (
    functions: Knex.SchemaBuilder[],
  ): Promise<void> => functions.reduce((p, func) => p.then(() => func), Promise.resolve());

  const addTrigger = (
    t: typeof tables[0],
  ): Knex.SchemaBuilder => knex.schema
    .raw(`DROP TRIGGER IF EXISTS ${triggerName(t.source)}`)
    .raw(trigger(t.source, t.update, t.pkeys));

  return runSequence(tables.map((t) => addTrigger(t)));
}

export async function down(knex: Knex): Promise<void> {
}
