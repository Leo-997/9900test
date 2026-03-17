import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    'zcc_sample',
    function addCuratorsToSample(table) {
      table.string('primary_curator_id');
      table.string('secondary_curator_id');

      table.index('primary_curator_id');
      table.index('secondary_curator_id');

      table.foreign('primary_curator_id').references('id').inTable('zcc_users');
      table
        .foreign('secondary_curator_id')
        .references('id')
        .inTable('zcc_users');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
