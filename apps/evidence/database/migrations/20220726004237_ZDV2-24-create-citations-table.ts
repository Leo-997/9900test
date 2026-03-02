import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_citations', (table) => {
    table.uuid('id').primary();
    table.string('title').notNullable();
    table.string('authors').defaultTo(null);
    table.string('publication').defaultTo(null);
    table.integer('year').defaultTo(null);
    table.string('link').defaultTo(null);
    table.string('source').notNullable();
    table.string('externalId').defaultTo(null);
    table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
    table.string('createdBy').notNullable();
    table.timestamp('updatedAt');
    table.string('updatedBy');
    table.timestamp('deletedAt');
    table.string('deletedBy');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

