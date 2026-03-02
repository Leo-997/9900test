import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_annotation_summary', (table) => {
    table.increments('summary_id');
    table.string('summary', 500).nullable().defaultTo(null);
    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.string('created_by', 255);
    table.timestamp('created_at');
    table.integer('summary_thread_id', 10).unsigned().notNullable();
    table.string('sample_id', 150);

    table.index('summary_thread_id');
    table
      .foreign('summary_thread_id')
      .references('zcc_annotation_summary_thread.summary_thread_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
