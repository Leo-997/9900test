import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_germline_recommendations', (table) => {
    table.uuid('id').notNullable();
    table.string('option').notNullable();

    table.primary(['id', 'option']);
    table.index('id');
    table.index('option');

    table
      .foreign('id')
      .references('id')
      .inTable('zcc_clinical_recommendations')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
