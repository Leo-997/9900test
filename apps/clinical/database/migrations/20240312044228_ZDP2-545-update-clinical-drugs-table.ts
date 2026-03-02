import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_drugs', (table) => {
    table.string('clinical_version_id').after('id');
    table.boolean('fda_approved').after('company');
    table.boolean('artg_approved').after('fda_approved');
    table.boolean('pbs_approved').after('artg_approved');
    table.boolean('appropriate_clinical_trial').after('pbs_approved');
    table.boolean('show_in_report').after('appropriate_clinical_trial').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
}
