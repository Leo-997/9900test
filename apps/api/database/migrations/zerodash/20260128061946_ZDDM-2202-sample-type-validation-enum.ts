import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.enu('sample_type', [
        'wgs',
        'rnaseq',
        'panel',
        'methylation',
        'hts',
        'pdx',
        'tma',
        'snp',
        'str',
    ]).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.enu('sample_type', [
        'wgs',
        'rnaseq',
        'panel',
        'methylation',
        'hts',
        'pdx',
      ]).alter();
  });
}
