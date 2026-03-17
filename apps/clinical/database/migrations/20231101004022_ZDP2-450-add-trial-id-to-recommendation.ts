import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_recommendations', (table) => {
    table.uuid('clinical_trial_id').after('therapy_id').defaultTo(null);

    table.foreign('clinical_trial_id')
      .references('id')
      .inTable('zcc_clinical_trials')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
