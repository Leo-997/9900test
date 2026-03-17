import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_prism_genes',
    function createPrismGenesTbl(table) {
      table.integer('gene_id', 10).unsigned().primary();
      table.text('gene_desc').defaultTo(null);
      table.integer('entrez', 11).defaultTo(null);
      table.string('genomic_loc', 150).defaultTo(null);
      table.integer('tier', 1).defaultTo(null);
      table.boolean('hallmark').defaultTo(null);
      table.string('chrband', 150).defaultTo(null);
      table.boolean('somatic').defaultTo(null);
      table.boolean('germline').defaultTo(null);
      table.text('somatic_tumour_types').defaultTo(null);
      table.text('germline_tumour_types').defaultTo(null);
      table.string('cancer_syndrome', 500).defaultTo(null);
      table.string('tissue_type', 50).defaultTo(null);
      table.string('molecular_genetics', 50).defaultTo(null);
      table.string('cancer_role', 250).defaultTo(null);
      table.string('mut_types', 100).defaultTo(null);
      table.text('translocation').defaultTo(null);
      table.boolean('other_germline_mut').defaultTo(null);
      table.text('other_syndrome').defaultTo(null);
      table.text('synonyms').defaultTo(null);
      table.string('gene_lists', 250).defaultTo(null);

      table
        .foreign('gene_id', 'zcc_prism_genes_gene_id_fk')
        .references('gene_id')
        .inTable('zcc_genes')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
