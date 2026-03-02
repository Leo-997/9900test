import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', function addTissueType(table) {
    table
      .enum('tissue', ['TT', 'BMA', 'BMT', 'CSF', 'PB', 'SK', 'PF', 'CL'])
      .defaultTo(null)
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {}
