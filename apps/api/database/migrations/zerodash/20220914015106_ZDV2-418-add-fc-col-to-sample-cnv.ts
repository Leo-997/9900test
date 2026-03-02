import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_cnv', (table) => {
    return table.double('fc').after('rna_zscore');
  });
}


export async function down(knex: Knex): Promise<void> {
}

