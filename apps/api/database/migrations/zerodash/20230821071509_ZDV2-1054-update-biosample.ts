import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.dropForeign(['assay_id'], 'zcc_biosamples_assay');
    table.dropIndex(['assay_id'], 'zcc_biosamples_assay_idx');
    table.enum('biosample_type', [
      'dna',
      'rna',
      'protein',
    ])
      .after('biosample_status');
    table.enum('biosample_source', [
      'normal',
      'tumour',
      'pdx',
      'cells',
      'ctdna',
      'ctc',
      'csf',
      'hts',
    ])
      .after('biosample_type');
  });
}

export async function down(knex: Knex): Promise<void> {
}
