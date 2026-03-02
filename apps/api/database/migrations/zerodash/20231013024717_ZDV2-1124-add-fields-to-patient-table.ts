import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_patient', (table) => {
    table.integer('age_at_enrolment').unsigned().after('age_at_death');
    table.string('stage', 50).after('clinical_history');
    table.string('status', 50).after('stage');
  });
}

export async function down(knex: Knex): Promise<void> {
}
