import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_approvals', (table) => {
    table
      .boolean('show_on_report')
      .defaultTo(true)
      .after('label');
  });
}

export async function down(knex: Knex): Promise<void> {
}
