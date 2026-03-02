import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    'zcc_donor',
    function createSampleSomaticSvTbl(table) {
      table.string('donor_id', 150).notNullable();
      table.string('sample_id', 150).notNullable();

      table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
      table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
      table.string('created_by');
      table.string('updated_by');

      table.primary(['donor_id', 'sample_id']);

      table.index('sample_id');
      table
        .foreign('sample_id')
        .references('zcc_sample.sample_id')
        .onDelete('CASCADE')
        .onUpdate('CASCADE');

      table.engine('InnoDB');
      table.charset('utf8');
    },
  );
}

export async function down(knex: Knex): Promise<void> {}
