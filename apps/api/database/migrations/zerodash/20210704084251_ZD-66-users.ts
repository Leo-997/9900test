import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(`zcc_users`, function createUsersTbl(table) {
    table.string('id').primary();
    table.string('azureId').unique().notNullable();
    table.string('given_name');
    table.string('family_name');
    table.string('email_address').unique().notNullable();

    table.index('azureId');
    table.index('email_address');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
