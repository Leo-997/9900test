import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    `zcc_sample`,
    function addCommentThreadIdToSampleTbl(table) {
      table.string('comment_thread_id', 255);
      table
        .foreign('comment_thread_id')
        .references('comment_thread_id')
        .inTable('zcc_comment_thread')
        .onDelete('RESTRICT')
        .onUpdate('CASCADE');
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

