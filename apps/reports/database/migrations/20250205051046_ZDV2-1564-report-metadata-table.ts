import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_reports_metadata', (table) => {
    table
      .uuid('report_id')
      .references('id')
      .inTable('zcc_reports')
      .notNullable()
      .onUpdate('CASCADE')
      .onDelete('CASCADE');
    table.string('key').notNullable().index();
    table.string('value').notNullable().index();

    table.primary(['report_id', 'key']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
