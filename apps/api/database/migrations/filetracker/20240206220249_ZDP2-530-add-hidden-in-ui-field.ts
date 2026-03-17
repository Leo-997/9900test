import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('datafiles', (table) => {
    table.boolean('is_hidden').defaultTo(false).after('flowcell_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
