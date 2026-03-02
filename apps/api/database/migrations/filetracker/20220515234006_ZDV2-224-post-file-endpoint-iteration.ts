import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_methylation', (table) => {
    table.uuid('file_id').primary().notNullable();
    table.foreign('file_id')
      .references('file_id')
      .inTable('datafiles')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table.enum('type', ['wgs', 'epic', 'mgmt']).notNullable();

    table.engine('InnoDB');
    table.charset('utf8');
  })
}


export async function down(knex: Knex): Promise<void> {
}

