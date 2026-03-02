import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curated_sample_methylation_genes', (table) => {
    table.string('meth_sample_id', 50).notNullable();
    table.integer('gene_id').unsigned().notNullable();
    table.float('median');
    table.float('lower');
    table.float('upper');
    table.string('reportable', 45);
    table.boolean('targetable');

    table.primary(['meth_sample_id', 'gene_id']);
    table.index('reportable','zcc_curated_sample_methylation_genes_reportable');
    table.index('gene_id', 'zcc_curated_sample_methylation_gene_id');

    table
      .foreign('gene_id')
      .references('gene_id')
      .inTable('zcc_genes')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table
      .foreign('meth_sample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  })
}


export async function down(knex: Knex): Promise<void> {
}

