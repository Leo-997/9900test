import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_rna_tsne', (table) => {
    table.string('biosample_id', 150).notNullable().primary();
    table.float('x').notNullable();
    table.float('y').notNullable();
    table.unique(['biosample_id', 'x', 'y']);
    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('zcc_rna_tsne');
}
