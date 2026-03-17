import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_patient', (table) => {
    table.string('enrolling_hospital', 500).after('hospital');
  });
}

export async function down(knex: Knex): Promise<void> {
}
