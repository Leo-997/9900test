import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_gene_note', (table) => {
    table.increments('id').primary();
    table.integer('gene_id').unsigned().notNullable().unique();
    table.text('note').notNullable();

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_gene_note');
}
