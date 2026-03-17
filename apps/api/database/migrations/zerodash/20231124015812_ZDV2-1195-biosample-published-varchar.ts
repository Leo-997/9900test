import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.string('published', 20).alter();
  });
}
export async function down(knex: Knex): Promise<void> {
}
