import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_resources', (table) => {
    table.index('name');
    table.index('url');
    table.index('fileId');
  });
}

export async function down(knex: Knex): Promise<void> {
}
