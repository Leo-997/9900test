import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_platforms', (table) => {
    table.string('provider', 50).nullable().defaultTo(null).after('platform_type');
  });
}


export async function down(knex: Knex): Promise<void> {
}

