import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_addendum', (table) => {
    table.index('addendum_type');

    table
      .foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
