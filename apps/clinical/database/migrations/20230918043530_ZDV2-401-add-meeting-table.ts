import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_meetings', (table) => {
    table.increments('id').primary();
    table.date('date').notNullable();
    table.uuid('chair');
    table.string('type', 5).defaultTo('MTB');

    table.index('chair');
    table.index('date');
    table.index('type');

    table.unique(['date', 'type']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
