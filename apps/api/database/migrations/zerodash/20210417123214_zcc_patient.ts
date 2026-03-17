import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_patient',
    function createPatientTbl(table) {
      table.string('patient_id').primary();
      table.string('zcc_subject_id').defaultTo(null);
      table.string('internal_id').defaultTo(null);
      table.enum('sex', ['Male', 'Female', 'Multi', 'Unknown']).defaultTo(null);
      table.integer('age_at_diagnosis').unsigned().defaultTo(null);
      table.integer('age_at_death').unsigned().defaultTo(null);
      table.enum('vital_status', ['Alive', 'Dead', 'Unknown']).defaultTo(null);
      table.string('hospital', 500).defaultTo(null);
      table.timestamp('enrolment_date').defaultTo(null);
      table.text('clinical_history').defaultTo(null);
      table.text('comments').defaultTo(null);

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
