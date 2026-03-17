import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slide_attachments', (table) => {
    table
      .foreign('slide_id')
      .references('id')
      .inTable('zcc_clinical_slides')
      .onDelete('RESTRICT')
      .onUpdate('RESTRICT');
  });
}

export async function down(knex: Knex): Promise<void> {
}
