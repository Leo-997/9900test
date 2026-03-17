import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('zcc_roles', (table) => {
    table.string('role');
    table.string('zcc_user_id');

    table.primary(['role', 'zcc_user_id']);
    table.index('role');
    table.index('zcc_user_id');

    table
      .foreign(['zcc_user_id'])
      .references(['id'])
      .inTable('zcc_users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {}
