import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.integer('pecan_count').defaultTo(null);
  })
  .alterTable('zcc_genes', (table) => {
    table.boolean('haploinsufficient').defaultTo(null);
  })
}


export async function down(knex: Knex): Promise<void> {
}

