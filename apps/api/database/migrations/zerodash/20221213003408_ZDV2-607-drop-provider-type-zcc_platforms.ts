import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_platforms', (table) => {
    table.dropColumn('provider');
    table.dropUnique(['platform']);
    table.unique(['platform', 'platform_type']);
  });
}


export async function down(knex: Knex): Promise<void> {
}

