import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_clinical_slides_sections', (table) => {
    table.integer('width').after('order').defaultTo(8).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
}
