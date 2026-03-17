import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_somatic_snv_counts', (table) => {
    table.dropForeign(['variant_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
