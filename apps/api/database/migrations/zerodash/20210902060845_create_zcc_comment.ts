import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_comment`,
    function createSummaryCommentTbl(table) {
      table.string('comment_id', 255).primary();
      table.string('comment_thread_id').notNullable();
      table.string('comment', 2048).notNullable();
      table.boolean('is_deleted').notNullable().defaultTo(false);
      
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table
        .foreign('comment_thread_id')
        .references('comment_thread_id')
        .inTable('zcc_comment_thread')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}