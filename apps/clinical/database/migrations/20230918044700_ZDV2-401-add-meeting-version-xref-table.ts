import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_meeting_version_xref', (table) => {
    table.integer('meeting_id').unsigned().notNullable();
    table.uuid('clinical_version_id').notNullable();

    table.foreign('meeting_id')
      .references('id')
      .inTable('zcc_clinical_meetings')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.foreign('clinical_version_id')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.primary(['meeting_id', 'clinical_version_id']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
