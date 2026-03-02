import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_genes', (table) => {
    table.text('rna_transcript').nullable().defaultTo(null).after('haploinsufficient');
  })
}


export async function down(knex: Knex): Promise<void> {
}

