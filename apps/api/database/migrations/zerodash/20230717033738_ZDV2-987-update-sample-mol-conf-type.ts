import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('molecular_confirmation', 50).alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
