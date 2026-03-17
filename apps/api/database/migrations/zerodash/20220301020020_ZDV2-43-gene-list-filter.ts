import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_gene_lists', (table) => {
    table.increments('list_id').primary();
    table.string('list_name').unique().notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').notNullable();

    table
      .foreign('created_by')
      .references('id')
      .inTable('zcc_users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

