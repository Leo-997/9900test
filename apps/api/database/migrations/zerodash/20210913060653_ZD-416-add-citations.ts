import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_citation`,
    function addExpediteToSampleTbl(table) {
      table.string('id').primary();
      table.string('title', 1024).notNullable();
      table.string('authors', 1024);
      table.string('publication');
      table.integer('year').unsigned();
      table.string('link', 2048);
      table.string('source').notNullable(); // Currently Book, Journal, Pubmed.. potential others in future
      table.string('external_id'); // Currently for pubmed id

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
