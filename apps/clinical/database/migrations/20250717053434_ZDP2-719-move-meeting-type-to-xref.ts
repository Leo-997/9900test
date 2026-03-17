/* eslint-disable no-empty-function */
import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zcc_clinical_meeting_version_xref', (table) => {
    // Drop foreign key constraint for primary keys 'meeting_id' and 'clinical_version_id'
    table.dropForeign(['clinical_version_id'], 'zcc_clinical_meeting_version_xref_clinical_version_id_foreign');
    table.dropForeign(['meeting_id'], 'zcc_clinical_meeting_version_xref_meeting_id_foreign');

    // Drop primary key constraint
    table.dropPrimary();

    // add meeting type as a part of primary key
    // (the same 'meeting_id' and 'clinical_version_id' combinations can have different types)
    table.string('type', 5).defaultTo('MTB').notNullable();
    table.primary(['meeting_id', 'clinical_version_id', 'type']);

    // add foreign key constraint back
    table
      .foreign('clinical_version_id', 'zcc_clinical_meeting_version_xref_clinical_version_id_foreign')
      .references('id')
      .inTable('zcc_clinical_versions')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    table
      .foreign('meeting_id', 'zcc_clinical_meeting_version_xref_meeting_id_foreign')
      .references('id')
      .inTable('zcc_clinical_meetings')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');

    // a type of meeting of a version shouldn't duplicate
    table.unique(['clinical_version_id', 'type'], { indexName: 'zcc_clinical_version_meeting_type_unique' });
  });

  await knex.schema.alterTable('zcc_clinical_meetings', (table) => {
    table.dropUnique(['date', 'type'], 'zcc_clinical_meetings_date_type_unique');
    table.dropColumn('type');
  });
}

export async function down(knex: Knex): Promise<void> {
}
