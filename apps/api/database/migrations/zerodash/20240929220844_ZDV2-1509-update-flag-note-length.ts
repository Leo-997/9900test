import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('zcc_flag_for_corrections', (table) => {
    table.text('reason_note').alter();
    table.text('correction_note').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
}
