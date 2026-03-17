import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    `zcc_sample`,
    function addExpediteToSampleTbl(table) {
      table.boolean('expedite').notNullable().defaultTo(false);
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

