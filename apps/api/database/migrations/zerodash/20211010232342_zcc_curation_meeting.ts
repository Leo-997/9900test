import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curation_meeting', (table) => {
    table.increments('meeting_id');
    table.boolean('is_completed').defaultTo(false);
    table.string('date').unique().defaultTo(null);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
