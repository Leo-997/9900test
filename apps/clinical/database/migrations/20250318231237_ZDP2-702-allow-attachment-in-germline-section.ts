import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slide_attachments', (table) => {
    table.uuid('section_id').after('file_id').defaultTo(null);

    table.foreign('section_id')
      .references('id')
      .inTable('zcc_clinical_slides_sections')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
