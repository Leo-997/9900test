import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.boolean('published').defaultTo(null);
});
}


export async function down(knex: Knex): Promise<void> {
}

