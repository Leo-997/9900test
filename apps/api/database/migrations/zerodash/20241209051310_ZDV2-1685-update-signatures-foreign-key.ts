import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_somatic_mutsig_counts', (table) => {
    table.dropForeign(['signature']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
