import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('meth_sample_id', 255).nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

