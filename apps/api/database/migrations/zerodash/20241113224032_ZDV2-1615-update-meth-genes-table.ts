import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_methylation_genes', async (table) => {
    table.string('biosample_id', 150).after('meth_sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('meth_sample_id'),
        })
        .from({ meth: 'zcc_curated_sample_methylation_genes' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_methylation_genes', (table) => {
        table.dropForeign(['meth_sample_id'], 'zcc_curated_sample_methylation_genes_meth_sample_id_foreign');
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_methylation_genes', (table) => {
        table.dropPrimary();
        table.primary(['biosample_id', 'gene_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_methylation_genes', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_methylation_genes', (table) => {
        table.dropColumn('meth_sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
