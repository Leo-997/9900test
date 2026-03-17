import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_slide_settings', (table) => {
    table.string('slide_id').notNullable();
    table.string('setting').notNullable();
    table.string('value').notNullable();

    table.index(['slide_id']);
    table.primary(['slide_id', 'setting']);

    table
      .foreign('slide_id')
      .references('id')
      .inTable('zcc_clinical_slides')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
