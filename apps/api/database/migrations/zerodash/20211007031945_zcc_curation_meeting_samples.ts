import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('zcc_curation_meeting_samples', (table) => {
    table.increments('id');
    table.string('meeting_id');
    table.string('sample_id').unique();
    table
      .foreign('sample_id')
      .references('sample_id')
      .inTable('zcc_sample')
      .onDelete('RESTRICT')
      .onUpdate('CASCADE');

    table.string('priority').defaultTo(null);
    table.engine('InnoDB');
    table.charset('utf8');
  });
}

export async function down(knex: Knex): Promise<void> {}
