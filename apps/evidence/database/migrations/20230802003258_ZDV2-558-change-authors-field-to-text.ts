import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_citations', (table) => {
    table.dropIndex(['authors']);
  })
    .then((() => knex.schema.alterTable('zcc_citations', (table) => {
      table.text('authors').alter();
    })));
}

export async function down(knex: Knex): Promise<void> {}
