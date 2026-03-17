import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function addCuratorsToSample(table) {
      table
        .string('primary_curation_status')
        .defaultTo(null)
        .after('curation_status');
      table
        .string('secondary_curation_status')
        .defaultTo(null)
        .after('curation_status');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
