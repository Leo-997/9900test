import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const rows = await knex
    .select({
      tableName: 'table_name',
      constraintName: 'constraint_name',
    })
    .from('information_schema.key_column_usage')
    .where('referenced_table_name', 'zcc_users')
    .andWhere('table_schema', 'zcczerodashhg38');

  await Promise.all(rows.map((row) => (
    knex.raw(`ALTER TABLE ${row.tableName} DROP FOREIGN KEY ${row.constraintName}`)
  )));
}

export async function down(knex: Knex): Promise<void> {
}
