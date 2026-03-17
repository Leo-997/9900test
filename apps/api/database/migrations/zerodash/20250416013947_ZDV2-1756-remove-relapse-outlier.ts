import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_rna_relapse_comparison', (table) => {
      table.dropColumn('outlier');
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .alterTable('zcc_rna_relapse_comparison', (table) => {
      table.boolean('outlier').nullable();
    });
}
