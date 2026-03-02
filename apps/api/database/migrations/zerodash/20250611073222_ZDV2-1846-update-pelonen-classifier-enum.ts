import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_rnaseq_classification', (table) => {
    table
      .enum('classifier', [
        'ALLSorts',
        'TALLSorts',
        'TALL subtype classification',
        'TALL genetic subtype classification',
        'TALL risk group classification'])
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
