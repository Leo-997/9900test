import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.dropColumn('assay_id');
    table.enum('biosample_source', [
      'ctdna',
      'ctc',
      'csf',
      'cells',
      'normal',
    ]).alter();
    table.enum('specimen', [
      'BMA',
      'BMT',
      'BR',
      'CB',
      'CL',
      'CSF',
      'NPA',
      'NT',
      'PB',
      'PCC',
      'PEF',
      'PF',
      'SAL',
      'SC',
      'SK',
      'TI',
      'TT',
      'UN',
      'UR',
      'BSW',
      'SW',
      'Other',
      'HF',
      'BAL',
      'STL',
    ]).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
