import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function changeZccSampleValidationFields(table) {
      table.dropColumn('plots_validated');
      table.dropColumn('qc_metrics_validated');
      table.dropColumn('patient_profile_validated');

      table
        .boolean('precuration_validated')
        .defaultTo(false)
        .notNullable()
        .after('comments');
      table
        .string('precuration_validated_by', 255)
        .notNullable()
        .after('comments');
      table
        .timestamp('precuration_validated_at')
        .after('comments');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

