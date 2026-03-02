import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_rnaseq', (tbl) => {
    tbl
      .integer('summary_thread_id', 10)
      .unsigned()
      .defaultTo(null)
      .after('curator_summary');
    tbl
      .integer('comment_thread_id', 10)
      .unsigned()
      .defaultTo(null)
      .after('comments');

    tbl
      .foreign(['comment_thread_id'])
      .references(['comment_thread_id'])
      .inTable('zcc_annotation_comment_thread')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    tbl
      .foreign(['summary_thread_id'])
      .references(['summary_thread_id'])
      .inTable('zcc_annotation_summary_thread')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {}
