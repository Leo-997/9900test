import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_patient', (table) => {
    table.timestamp('registration_date').after('enrolment_date');
  });
}

export async function down(knex: Knex): Promise<void> {
}
