import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_clinical_comment_version', (table) => {
    table.uuid('id').primary();
    table.uuid('comment_id').notNullable();
    table.text('comment').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.string('created_by').notNullable();

    table.foreign('comment_id')
      .references('id')
      .inTable('zcc_clinical_comment')
      .onUpdate('CASCADE')
      .onDelete('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {
}
