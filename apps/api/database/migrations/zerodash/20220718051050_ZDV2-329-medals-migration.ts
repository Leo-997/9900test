import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.string('pecan_somatic_medal', 20).defaultTo(null);
    table.string('pecan_germline_medal', 20).defaultTo(null);
    table.dropColumn('sjc_medal');
  })
  .alterTable('zcc_curated_snv', (table) => {
    table.dropColumn('pecan_somatic_medal');
    table.dropColumn('pecan_germline_medal');
    table.dropColumn('sjc_medal');
  })
}


export async function down(knex: Knex): Promise<void> {
}

