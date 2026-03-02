import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_annotation_digest', (table) => {
    table.increments('digest_id');
    table.string('digest', 500).nullable().defaultTo(null);
    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.string('created_by', 255);
    table.timestamp('created_at');
    table.string('updated_by', 255).nullable();
    table.timestamp('updated_at').nullable();
    table.integer('digest_thread_id', 10).unsigned().notNullable();
    table.string('sample_id', 150);

    table.index('digest_thread_id');
    table
      .foreign('digest_thread_id')
      .references('zcc_annotation_digest_thread.digest_thread_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
