import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_reports', table => {
    table.uuid('file_id').primary().notNullable();
    table.string('report_type', 50).notNullable();
    table.string('version').notNullable();
  })
}


export async function down(knex: Knex): Promise<void> {
}

