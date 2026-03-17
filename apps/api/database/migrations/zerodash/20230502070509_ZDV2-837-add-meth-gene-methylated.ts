import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_methylation_genes', (table) => {
    table
      .enum('meth_status', ['methylated', 'unmethylated'])
      .defaultTo(null)
      .after('gene_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
