import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curation_comment_thread', (table) => {
    table.uuid('id').primary();
    table.string('thread_type', 50).notNullable();
    table.string('sample_id', 150).notNullable();
    table.string('entity_id');
    table.string('entity_type', 50);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at');
    table.string('updated_by');
    table.timestamp('deleted_at');
    table.string('deleted_by');

    table.index(['thread_type']);
    table.index(['entity_id']);
    table.index(['entity_type']);
    table.unique(
      ['sample_id', 'entity_id', 'entity_type', 'thread_type'],
      'zcc_curation_comment_thread_unique',
    );
    table.foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onUpdate('CASCADE')
      .onDelete('RESTRICT');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
