import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_methylation_xref', table => {
    table.string('meth_class', 200).notNullable().alter();
    table.string('meth_family', 200).nullable().alter();
  });
}


export async function down(knex: Knex): Promise<void> {
}

