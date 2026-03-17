import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_list_contains_gene', (table) => {
    table.increments('id').primary();
    table.integer('gene_id').unsigned().notNullable();
    table.integer('list_id').unsigned().notNullable();

    table
      .foreign('gene_id')
      .references('gene_id')
      .inTable('zcc_genes')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table
      .foreign('list_id')
      .references('list_id')
      .inTable('zcc_gene_lists')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

