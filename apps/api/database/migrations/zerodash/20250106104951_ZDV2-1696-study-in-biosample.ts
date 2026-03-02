import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.string('study', 50).after('platform_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
