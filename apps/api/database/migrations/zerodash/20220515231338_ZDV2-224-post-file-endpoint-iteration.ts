import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_client_applications', (table) => {
    table.uuid('id').primary().notNullable();
    table.string('name').notNullable();
    table.string('azure_id').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}


export async function down(knex: Knex): Promise<void> {
}

