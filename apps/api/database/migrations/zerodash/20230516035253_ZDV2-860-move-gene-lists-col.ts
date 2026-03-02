import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_genes', (table) => {
    table.string('gene_lists').defaultTo(null);

    table.index(['gene_lists'], 'idx_genelists');
    table.index(['gene_id', 'gene_lists'], 'idx_geneid_genelists');
  });
}

export async function down(knex: Knex): Promise<void> {
}
