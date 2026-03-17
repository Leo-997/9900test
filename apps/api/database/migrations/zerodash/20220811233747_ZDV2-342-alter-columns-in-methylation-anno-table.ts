import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_anno', (table) => {
    table.string('strand_hg38', 1).defaultTo(null).alter();
    table.integer('pos_hg19', 11).defaultTo(null).alter();
    table.string('strand_hg19', 1).defaultTo(null).alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}