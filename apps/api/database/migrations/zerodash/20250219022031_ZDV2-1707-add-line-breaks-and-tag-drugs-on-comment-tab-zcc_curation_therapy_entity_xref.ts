import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curation_therapy_entity_xref',
    (table) => {
      table.uuid('therapy_id');
      table.string('entity_type');
      table.string('entity_id');

      table.primary(['therapy_id', 'entity_type', 'entity_id']);

      table
        .foreign('therapy_id')
        .references('id')
        .inTable('zcc_curation_therapies')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {
}
