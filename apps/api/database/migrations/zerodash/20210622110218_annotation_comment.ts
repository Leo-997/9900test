import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_annotation_comment', (table) => {
    table.increments('comment_id');
    table.string('comment', 500).nullable().defaultTo(null);
    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.string('created_by', 255);
    table.timestamp('created_at');
    table.integer('comment_thread_id', 10).unsigned().notNullable();
    table.string('sample_id', 150);

    table.index('comment_thread_id');
    table
      .foreign('comment_thread_id')
      .references('zcc_annotation_comment_thread.comment_thread_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
