import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_patient', (table) => {
    table.double('consanguinity').nullable().defaultTo(null).after('germline_aberration');
  });
}

export async function down(knex: Knex): Promise<void> {
}
