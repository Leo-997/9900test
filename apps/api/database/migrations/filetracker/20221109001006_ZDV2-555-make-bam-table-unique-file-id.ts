import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_zd_bam', (table) => {
    table.string('file_id').primary().alter();

    table
      .foreign('file_id')
      .references('file_id')
      .inTable('datafiles')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
}

