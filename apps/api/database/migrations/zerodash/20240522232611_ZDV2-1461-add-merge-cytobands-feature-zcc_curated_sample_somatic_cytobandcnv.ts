import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_cytobandcnv', async (table) => {
    table.double('custom_cn').defaultTo(null).after('avecopynumber');
  });
}

export async function down(knex: Knex): Promise<void> {
}
