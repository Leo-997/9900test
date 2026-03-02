import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_comment_thread_xref', (table) => {
    table.uuid('thread_id');
    table.uuid('comment_id');
    table.boolean('is_hidden').defaultTo(false);
    table.boolean('is_resolved').defaultTo(false);
    table.integer('report_order').defaultTo(null);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');

    table.primary(['thread_id', 'comment_id']);
    table.foreign('thread_id')
      .references('id')
      .inTable('zcc_clinical_comment_thread')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');
    table.foreign('comment_id')
      .references('id')
      .inTable('zcc_clinical_comment')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
