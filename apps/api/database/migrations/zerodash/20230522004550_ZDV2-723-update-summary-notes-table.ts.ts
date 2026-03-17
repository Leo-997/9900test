import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_sample_summary_notes', (table) => {
    table.string('sample_id', 150).notNullable();
    table.string('type', 50).notNullable();
    table.text('note');
    table.date('date').nullable().defaultTo(null);

    table.primary(['sample_id', 'type']);
    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onUpdate('RESTRICT')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
