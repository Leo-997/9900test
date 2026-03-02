import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.string('pfam_id');
    table.string('pfam_domain');
    table.string('pfam_description', 500);
  });
}


export async function down(knex: Knex): Promise<void> {
}

