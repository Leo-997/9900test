import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_curation_meeting', (table) => {
    table.date('date').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
