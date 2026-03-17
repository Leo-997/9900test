import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_alias', (table) => {
    table.string('biosample_id', 150).notNullable().primary();
    table.string('alias', 150).defaultTo(null);
    table.string('alias_type', 50).defaultTo(null);
    table
      .foreign(['biosample_id'], 'zcc_alias_biosample_id')
      .references(['biosample_id'])
      .inTable('zcc_biosample')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
