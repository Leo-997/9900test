import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.renameTable('zcc_samples', 'zcc_biosample');
}


export async function down(knex: Knex): Promise<void> {
}

