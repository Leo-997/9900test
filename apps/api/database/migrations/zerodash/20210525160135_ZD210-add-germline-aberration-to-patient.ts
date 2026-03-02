import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_patient',
    function addGermlineAberationToPatient(table) {
      table.string('germline_aberration').defaultTo(null).after('sex');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
