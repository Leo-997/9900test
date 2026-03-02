import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // drop the old data model table
  await knex.schema.dropTableIfExists('zcc_clinical_comment');
  return knex.schema.createTable('zcc_clinical_comment', (table) => {
    table.uuid('id').primary();
    table.text('comment');
    table.string('type', 50);
    table.boolean('is_hidden').defaultTo(false);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by');
    table.timestamp('updated_at');
    table.string('updated_by');
    table.timestamp('deleted_at');
    table.string('deleted_by');

    table.index(['type']);

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
