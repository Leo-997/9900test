import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  return knex.schema.createTable(
    'zcc_rnaseq_counts',
    function createRnaseqCountsTbl(table) {
      table.integer('gene_id', 11).unsigned().notNullable();
      table.integer('sample_count', 11).defaultTo(null);
      table.integer('cancer_types', 11).defaultTo(null);
      table.integer('reported_count', 11).unsigned().defaultTo(null);
      table.integer('targetable_count', 11).unsigned().defaultTo(null);
      
      table.primary(['gene_id']);

      table.index('gene_id');
      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
