import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slides', (table) => {
    table.string('clinical_version_id').after('id').notNullable();

    table
      .foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
}
