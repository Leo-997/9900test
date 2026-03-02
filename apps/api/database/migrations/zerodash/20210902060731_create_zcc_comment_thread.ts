import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    `zcc_comment_thread`,
    function createSummaryCommentTbl(table) {
      table.string('comment_thread_id', 255).primary();

      table.string('created_by');
      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

