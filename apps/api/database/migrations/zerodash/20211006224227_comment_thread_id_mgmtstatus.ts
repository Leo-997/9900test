import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable(
    `zcc_curated_sample_somatic_mgmtstatus`,
    function addCommentThreadId(table) {
      table.string('comment_thread_id').notNullable();
    },
  );
}


export async function down(knex: Knex): Promise<void> {
}

