import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slide_attachments', (table) => {
    table.boolean('is_at_bottom').after('order').defaultTo(false).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
}
