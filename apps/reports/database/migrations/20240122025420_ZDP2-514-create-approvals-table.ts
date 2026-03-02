import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_approvals', (table) => {
    table.uuid('id').notNullable().primary();
    table.uuid('report_id').notNullable();
    table.string('status', 50).notNullable();
    table.string('role').defaultTo(null);
    table.string('assignee').defaultTo(null);
    table.string('approved_by').defaultTo(null);
    table.timestamp('approved_at').defaultTo(null);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').notNullable();
    table.timestamp('updated_at').defaultTo(null);
    table.string('updated_by').defaultTo(null);

    table.index(['status']);

    table.foreign('report_id')
      .references('id')
      .inTable('zcc_reports')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
