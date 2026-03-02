import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curation_atlas_notes', (table) => {
    table.uuid('id').primary();
    table.string('entity_type', 50).notNullable();
    table.string('version', 10);
    table.text('notes');

    table.unique(['entity_type', 'version']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
