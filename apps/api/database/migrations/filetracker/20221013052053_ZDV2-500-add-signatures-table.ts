import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_zd_signatures', table => {
    table.uuid('file_id').primary();
    table.string('filename').notNullable();
    table.string('md5', 32).notNullable();
    table.string('user').notNullable();
    table.string('key').notNullable();
    table.string('bucket').notNullable();
    table.string('etag').notNullable();


    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

