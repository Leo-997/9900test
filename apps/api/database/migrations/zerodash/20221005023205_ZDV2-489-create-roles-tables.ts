import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_roles', table => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.unique(['name']);

    table.engine('InnoDB');
    table.charset('utf8');
  })
  .then(() => {
    return knex.schema.createTable('zcc_role_user_xref', table => {
      table.increments('id').primary();
      table.uuid('role_id').notNullable();
      table.uuid('user_id').notNullable();

      table.unique(['role_id', 'user_id']);

      table.foreign('role_id').references('id').inTable('zcc_roles');
      table.foreign('user_id').references('id').inTable('zcc_users');

      table.engine('InnoDB');
      table.charset('utf8');
    });
  });
}


export async function down(knex: Knex): Promise<void> {
}

