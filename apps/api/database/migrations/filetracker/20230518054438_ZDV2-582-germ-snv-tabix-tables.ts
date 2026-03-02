import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_tsv', (table) => {
    table.uuid('file_id').primary();
    table.enum('variant_type', [
      'SNV',
      'CNV',
      'RNA_SEQ',
      'CYTOGENETICS',
      'SV',
      'GERMLINE_CNV',
      'GERMLINE_SNV',
      'METHYLATION',
      'MUTATIONAL_SIG',
      'HTS',
    ]).notNullable();
    table.enum('type', ['index', 'main']).defaultTo('main');

    table.foreign('file_id')
      .references('file_id')
      .inTable('datafiles')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
