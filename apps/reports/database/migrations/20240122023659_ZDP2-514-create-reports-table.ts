import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_reports', (table) => {
    table.uuid('id').notNullable().primary();
    table.string('sample_id').notNullable();
    table.string('type', 50).notNullable();
    table.string('status', 50).notNullable();
    table.uuid('file_id');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').notNullable();
    table.timestamp('updated_at').defaultTo(null);
    table.string('updated_by').defaultTo(null);

    table.index(['type']);
    table.index(['sample_id']);
    table.index(['status']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
