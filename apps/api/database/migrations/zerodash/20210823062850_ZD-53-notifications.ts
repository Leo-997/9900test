import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_notifications', (table) => {
    table.string('id').primary();

    table
      .string('action')
      .notNullable()
      .comment(
        'Action being done on the feature. I.e Created, Edited, Tagged, Deleted, Assigned etc.',
      );
    table
      .string('feature')
      .notNullable()
      .comment('Feature this is being done on. I.e. Comment, Summary, Sample');

    table.string('subheader');
    table.string('description');

    table.boolean('is_read').notNullable().defaultTo(false);

    table.string('variant_type');
    table.string('variant_id');

    table.string('sample_id', 150).notNullable();

    table.string('notify_user_id').notNullable();
    table.string('created_by').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    table.index(['variant_type', 'variant_id']);
    table.index('sample_id');
    table.index('notify_user_id');
    table.index('created_by');

    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table
      .foreign('notify_user_id')
      .references('id')
      .inTable('zcc_users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');
    table
      .foreign('created_by')
      .references('id')
      .inTable('zcc_users')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
