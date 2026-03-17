import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_approvals', async (table) => {
    table.string('group_id').after('role');
  })
    .then(() => (
      knex
        .update({
          group_id: knex.raw('role'),
        })
        .from('zcc_approvals')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_approvals', (table) => {
        table.dropColumn('role');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
