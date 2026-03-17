import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_cnv', async (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex
        .update({
          biosample_id: knex.raw('sample_id'),
        })
        .from('zcc_curated_sample_somatic_cnv')
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cnv', (table) => {
        table.dropUnique(['sample_id', 'gene_id'], 'zcc_curated_sample_somatic_cnv_sample_id_gene_id_unique');
        table.dropUnique(['sample_id', 'gene_id', 'cn_type'], 'zcc_curated_sample_somatic_cnv_sample_id_gene_id_cn_type_index');
        table.dropIndex(['sample_id'], 'zcc_curated_sample_somatic_cnv_sample_id_index');
        table.unique(['biosample_id', 'gene_id']);
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cnv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_somatic_cnv', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
