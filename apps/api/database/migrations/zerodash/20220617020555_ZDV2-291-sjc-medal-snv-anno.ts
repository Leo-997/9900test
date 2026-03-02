import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_snv_anno', (table) => {
    table.enum('sjc_medal', [
      'gold', 
      'silver', 
      'bronze', 
      'none'
    ])
    .defaultTo(null);
  });
}


export async function down(knex: Knex): Promise<void> {
}

