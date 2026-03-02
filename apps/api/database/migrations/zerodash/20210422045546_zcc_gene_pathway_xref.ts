import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_gene_pathway_xref',
    function createPrismGenesTbl(table) {
      table.integer('gene_id').unsigned().notNullable();
      table.integer('pathway_id').unsigned().notNullable();

      table.primary(['gene_id', 'pathway_id']);

      table.index('gene_id');
      table.index('pathway_id');

      table
        .foreign('gene_id')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table
        .foreign('pathway_id')
        .references('pathway_id')
        .inTable('zcc_pathways')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
