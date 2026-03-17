import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.string('sift_pred', 100).defaultTo(null);
    table.string('polyphen_pred', 100).defaultTo(null);
  });
}


export async function down(knex: Knex): Promise<void> {
}

