import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('manifest_name', 50).after('manifest_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
