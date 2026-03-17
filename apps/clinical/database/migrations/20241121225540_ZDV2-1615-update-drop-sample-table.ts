import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const rows = await knex
    .select({
      tableName: 'table_name',
      constraintName: 'constraint_name',
    })
    .from('information_schema.key_column_usage')
    .where('referenced_table_name', 'zcc_clinical_samples')
    .andWhere('table_schema', process.env.DB_NAME_CLINICAL);

  await Promise.all(rows.map((row) => (
    knex.raw(`ALTER TABLE ${row.tableName} DROP FOREIGN KEY ${row.constraintName}`)
  )));
  return knex.schema.dropTable('zcc_clinical_samples');
}

export async function down(knex: Knex): Promise<void> {
}
