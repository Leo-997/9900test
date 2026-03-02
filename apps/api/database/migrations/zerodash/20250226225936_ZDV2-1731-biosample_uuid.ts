import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_biosample', (table) => {
    table.string('biosample_uuid', 22).after('biosample_id').unique();
  });
}

export async function down(knex: Knex): Promise<void> {
}
