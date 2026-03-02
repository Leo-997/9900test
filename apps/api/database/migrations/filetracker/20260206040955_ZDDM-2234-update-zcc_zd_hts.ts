import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_zd_hts', (table) => {
    table.enum('type', [
      'AUC',
      'IC50',
      'IC50Curve',
      'LN50',
      'LC50',
      'CELLS_END',
      'CELLS_START',
      'SUNRISE',
      'LOGR_BAF',
      'COPY_NUMBER',
      'QC_IC50Curve',
      'QC_PLATE',
      'QC_CORRELATION',
      'QC_MONITORING'
    ]).nullable().defaultTo(null).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}