import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_citations', (table) => {
    table.string('title', 1000).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
