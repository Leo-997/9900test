import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function addPrecurationValidation(table) {
      table
        .boolean('patient_profile_validated')
        .notNullable()
        .defaultTo(false)
        .after('loh_proportion');
      table
        .boolean('qc_metrics_validated')
        .notNullable()
        .defaultTo(false)
        .after('loh_proportion');
      table
        .boolean('plots_validated')
        .notNullable()
        .defaultTo(false)
        .after('loh_proportion');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
