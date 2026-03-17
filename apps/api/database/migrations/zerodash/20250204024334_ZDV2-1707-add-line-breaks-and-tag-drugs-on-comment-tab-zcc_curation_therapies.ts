import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_curation_therapies',
    (table) => {
      table.uuid('id').primary();
      table.boolean('chemotherapy');
      table.string('chemotherapy_note', 1024);
      table.boolean('radiotherapy');
      table.string('radiotherapy_note', 1024);
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.timestamp('updated_at');
      table.string('updated_by');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {
}
