import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_biosample', (table) => {
      table.dropColumn('zcc_sample_id');
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
        'DNA',
        'RNA',
      ])
        .alter();
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_biosample', (table) => {
    table.string('zcc_sample_id', 25).after('public_subject_id').nullable();
  });

  await knex.schema.alterTable('zcc_biosample', (table) => {
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
    ])
      .alter();
  });
}
