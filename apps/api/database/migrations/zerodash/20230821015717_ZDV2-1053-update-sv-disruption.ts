import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curated_sample_somatic_sv', (table) => {
    table
      .enum('mark_disrupted', [
        'No',
        'Yes',
        'Start',
        'End',
        'Both',
      ])
      .alter();
    table
      .enum('disrupted', [
        'No',
        'Yes',
        'Start',
        'End',
        'Both',
      ])
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
