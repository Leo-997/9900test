import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_references`,
    function createRefTbl(table) {
      table.increments('ref_id');
      table.text('reference');

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
