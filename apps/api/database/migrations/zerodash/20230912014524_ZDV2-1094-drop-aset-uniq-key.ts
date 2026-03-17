import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_analysis_set', (table) => {
    table.dropUnique(['patient_id', 'c1_event_num']);
  });
}

export async function down(knex: Knex): Promise<void> {
}
