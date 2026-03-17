import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.index('trial_id');
  });
}

export async function down(knex: Knex): Promise<void> {
}
