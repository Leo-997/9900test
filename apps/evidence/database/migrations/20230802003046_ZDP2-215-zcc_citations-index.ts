import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_citations', (table) => {
    table.index('title');
    table.index('authors');
    table.index('publication');
    table.index('source');
    table.index('externalId');
  });
}

export async function down(knex: Knex): Promise<void> {
}
