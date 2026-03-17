import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
    table.dropIndex('trial_id');
  })
    .then(() => (
      knex.schema.alterTable('zcc_clinical_drug_trials', (table) => {
        table.uuid('trial_id').alter();
        table.dropColumn('internal_trial_id');
        table.dropColumn('trial_name');
        table.dropColumn('trial_phase_id');
        table.dropColumn('trial_phase');
        table.dropColumn('trial_phase_name');
        table.dropColumn('requires_approval');

        table.foreign('trial_id')
          .references('id')
          .inTable('zcc_clinical_trials')
          .onDelete('RESTRICT')
          .onUpdate('CASCADE');
      })
    ));
}

export async function down(knex: Knex): Promise<void> {
}
