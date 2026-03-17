import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', table => {
    table.string('cosmic_id', 255).alter();
  })
}


export async function down(knex: Knex): Promise<void> {
}

