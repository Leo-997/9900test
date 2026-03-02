import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.dropColumn('failed');
    table.string('stage', 50).defaultTo(null);
    table.string('status', 255).defaultTo(null);
  });
}

export async function down(knex: Knex): Promise<void> {
}
