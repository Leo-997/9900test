import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slide_attachments', (table) => {
    table.integer('width').defaultTo(3).after('caption');
    table.integer('order').after('width');
    table.boolean('is_condensed').defaultTo(false).after('order');

    table.dropColumns('deleted_at', 'deleted_by');
  });
}

export async function down(knex: Knex): Promise<void> {
}
