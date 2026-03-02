import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_rnaseq', table => {
    table.string('gene_expression', 50).nullable();
  });
}


export async function down(knex: Knex): Promise<void> {
}

