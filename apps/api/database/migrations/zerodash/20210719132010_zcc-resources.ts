import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_sample_resources', (table) => {
    table.increments('resource_id');
    table.string('resource_name', 150).notNullable();
    table.enum('type', ['PDF', 'IMG', 'LINK']).notNullable();
    table.boolean('is_deleted').notNullable().defaultTo(false);
    table.string('url', 255).nullable();
    table.string('file_key', 150).nullable();
    table.string('sample_id', 150);

    table.index('sample_id');
    table
      .foreign('sample_id')
      .references('zcc_sample.sample_id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    table.string('created_by', 255);
    table.timestamp('created_at');
    table.string('updated_by', 255).nullable();
    table.timestamp('updated_at').nullable();

    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
