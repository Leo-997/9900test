import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_germline_cnv',
    (table) => {
      table.renameColumn('matched_normal_id', 'sample_id');
      table.dropForeign(['matched_normal_id'], 'zcc_cur_germ_cnv_norm_id_fk');

      table
        .foreign('sample_id', 'zcc_cur_germ_cnv_sample_id_fk')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.dropIndex(
        ['matched_normal_id', 'gene_id'],
        'uniq_matched_normal_id_gene_id',
      );

      table.unique(['sample_id', 'gene_id'], { indexName: 'uniq_sample_id_gene_id' });
      table.dropIndex(['matched_normal_id'], 'zcc_cur_germ_cnv_norm_id_idx');
      table.index(['sample_id', 'gene_id'], 'zcc_cur_germ_cnv_sample_id_idx');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
