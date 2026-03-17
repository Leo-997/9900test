import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_curated_sample_somatic_cnv',
    function updateIndexes(table) {
      table.index(['sample_id', 'gene_id', 'cn_type']);
      table.index(['gene_id', 'cn_type']);
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
