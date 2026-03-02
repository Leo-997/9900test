import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_approvals', async (table) => {
    table.string('assignee_id').after('assignee');

    table.index(['assignee_id']);
  })
    .then(() => (
      knex
        .update({
          assignee_id: knex.raw('assignee'),
        })
        .from('zcc_approvals')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_approvals', (table) => {
        table.dropIndex('assignee');
        table.dropColumn('assignee');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
