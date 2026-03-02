import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_versions', (table) => {
    table.string('frequency_units').nullable().defaultTo(null).after('expedite');
  });
}

export async function down(knex: Knex): Promise<void> {
}
