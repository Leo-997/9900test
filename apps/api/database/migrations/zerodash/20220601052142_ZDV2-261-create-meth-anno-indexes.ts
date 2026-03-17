import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.alterTable('zcc_methylation_anno', (table) => {
    table.index(['meth_sample_id'], 'meth_sample_anno_id_index');
    table.index([
      'chr_hg38',
      'start_hg38',
      'end_hg38'
    ], 'meth_anno_hg38_index');
    table.index([
      'chr_hg19',
      'pos_hg19',
    ], 'meth_anno_hg19_index');
    table.string('gencodebasicv12_name', 500).alter();
    table.index(['gencodebasicv12_name'], 'gencodebasicv12_name_index');
  });
}


export async function down(knex: Knex): Promise<void> {
}

