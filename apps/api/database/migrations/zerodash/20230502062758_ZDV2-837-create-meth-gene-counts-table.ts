import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('zcc_curated_methylation_genes_counts', (table) => {
      table.integer('gene_id').unsigned().notNullable().primary();
      table.integer('sample_count').defaultTo(null);
      table.integer('cancer_types').defaultTo(null);
      table.integer('reported_count').unsigned().defaultTo(null);
      table.integer('targetable_count').unsigned().defaultTo(null);
      
      table
      .foreign('gene_id', 'zcc_curated_methylation_genes_counts_gene_id_foreign')
      .references('gene_id')
      .inTable('zcc_genes')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    });
}


export async function down(knex: Knex): Promise<void> {
}

