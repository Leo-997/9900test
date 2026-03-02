import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_sample', (table) => {
    table.string('histologic_diagnosis').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
