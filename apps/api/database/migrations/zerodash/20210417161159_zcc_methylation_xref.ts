import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_methylation_xref',
    function createMethylationXrefTbl(table) {
      table.string('meth_class_id', 50).notNullable().primary();

      table.string('meth_class', 120).notNullable();
      table.string('meth_family', 70).defaultTo(null);
      table.integer('meth_category', 4).defaultTo(null);
      table.text('meth_summary').defaultTo(null);
      table.text('meth_evidence').defaultTo(null);

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
