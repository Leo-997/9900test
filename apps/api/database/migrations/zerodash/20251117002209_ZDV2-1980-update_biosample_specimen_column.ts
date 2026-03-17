import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.enu('specimen', [
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
      'DNA',
      'RNA',
      'XC',
      'XT']).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
