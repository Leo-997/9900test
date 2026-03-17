import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_curated_sample_germline_cnv', (table) => {
    table.string('biosample_id', 150).after('sample_id');

    table.foreign('biosample_id')
      .references('biosample_id')
      .inTable('zcc_biosample')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  })
    .then(() => (
      knex.update({
        biosample_id: knex
          .select('matched_normal_id')
          .from('zcc_sample')
          .where('sample_id', knex.raw('??', ['cnv.sample_id']))
          .first(),
      })
        .from({ cnv: 'zcc_curated_sample_germline_cnv' })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_cnv', (table) => {
        table.dropUnique(['sample_id', 'gene_id'], 'uniq_sample_id_gene_id');
        table.dropIndex(['sample_id', 'gene_id'], 'zcc_cur_germ_cnv_sample_id_idx');
        table.unique(['biosample_id', 'gene_id'], { indexName: 'uniq_biosample_id_gene_id' });
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_cnv', (table) => {
        table.string('biosample_id', 150).notNullable().alter();
      })
    ))
    .then(() => (
      knex.schema.alterTable('zcc_curated_sample_germline_cnv', (table) => {
        table.dropColumn('sample_id');
      })
    ));
}

export async function down(): Promise<void> {
}
